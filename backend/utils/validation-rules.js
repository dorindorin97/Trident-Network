/**
 * Centralized validation rules for Trident Network
 * Used by both backend validators and frontend components
 * 
 * Features:
 * - Centralized rule definitions
 * - Custom validators support
 * - Batch validation with error collection
 * - Type coercion and sanitization
 * - Comprehensive error messages
 * - Chainable validator builder API
 */

// Pattern builder utilities for consistent regex patterns
const PatternBuilder = {
  hex: (length = 64) => new RegExp(`^0x[a-fA-F0-9]{${length}}$`),
  decimal: (maxDecimals = 8) => new RegExp(`^\\d+(\\.\\d{1,${maxDecimals}})?$`),
  slug: () => /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  uuid: () => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  email: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: () => /^https?:\/\/.+/,
  base64: () => /^[A-Za-z0-9+/]*={0,2}$/
};

const RULES = {
  // Address validation
  address: {
    pattern: /^T[a-zA-Z0-9]{33}$/,
    minLength: 34,
    maxLength: 34,
    description: 'Address must start with T and be 34 characters',
    sanitize: (val) => val.trim()
  },

  // Block number/hash validation
  block: {
    numberPattern: /^\d+$/,
    hashPattern: PatternBuilder.hex(64),
    maxNumber: 999999999,
    description: 'Block must be a number or 0x-prefixed hash',
    sanitize: (val) => String(val).trim().toLowerCase()
  },

  // Transaction hash validation
  txHash: {
    pattern: PatternBuilder.hex(64),
    description: 'Transaction hash must be 0x-prefixed 64-char hex',
    sanitize: (val) => String(val).trim().toLowerCase()
  },

  // Pagination
  pagination: {
    maxLimit: 100,
    defaultLimit: 20,
    minLimit: 1,
    maxOffset: 1000000,
    minOffset: 0
  },

  // Amount/Balance
  amount: {
    maxValue: 999999999999,
    minValue: 0,
    maxDecimals: 8,
    pattern: PatternBuilder.decimal(8)
  },

  // Filters
  filters: {
    maxFieldLength: 256,
    maxFilterCount: 10,
    allowedStatuses: ['pending', 'confirmed', 'failed', 'active', 'inactive']
  }
};

/**
 * Enhanced validation error with context and suggestions
 */
class ValidationError extends Error {
  constructor(field, message, rule = null, context = {}) {
    super(`${field}: ${message}`);
    this.field = field;
    this.rule = rule;
    this.context = context;
    this.name = 'ValidationError';
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      field: this.field,
      message: this.message,
      rule: this.rule,
      context: this.context,
      timestamp: this.timestamp
    };
  }
}

/**
 * Validator builder for creating chainable custom validators
 */
class ValidatorBuilder {
  constructor(field) {
    this.field = field;
    this.validators = [];
    this.sanitizers = [];
    this.errorMessage = null;
  }

  required(message = null) {
    this.validators.push({
      test: (val) => val !== null && val !== undefined && val !== '',
      message: message || `${this.field} is required`
    });
    return this;
  }

  custom(testFn, message = 'Validation failed') {
    this.validators.push({
      test: testFn,
      message
    });
    return this;
  }

  matches(pattern, message = null) {
    this.validators.push({
      test: (val) => pattern.test(String(val)),
      message: message || `${this.field} format is invalid`
    });
    return this;
  }

  minLength(length, message = null) {
    this.validators.push({
      test: (val) => String(val).length >= length,
      message: message || `${this.field} must be at least ${length} characters`
    });
    return this;
  }

  maxLength(length, message = null) {
    this.validators.push({
      test: (val) => String(val).length <= length,
      message: message || `${this.field} cannot exceed ${length} characters`
    });
    return this;
  }

  min(value, message = null) {
    this.validators.push({
      test: (val) => parseFloat(val) >= value,
      message: message || `${this.field} must be at least ${value}`
    });
    return this;
  }

  max(value, message = null) {
    this.validators.push({
      test: (val) => parseFloat(val) <= value,
      message: message || `${this.field} cannot exceed ${value}`
    });
    return this;
  }

  enum(values, message = null) {
    this.validators.push({
      test: (val) => values.includes(val),
      message: message || `${this.field} must be one of: ${values.join(', ')}`
    });
    return this;
  }

  sanitize(fn) {
    this.sanitizers.push(fn);
    return this;
  }

  setErrorMessage(message) {
    this.errorMessage = message;
    return this;
  }

  validate(value, throwOnError = true) {
    let sanitized = value;

    // Apply sanitizers
    for (const sanitizer of this.sanitizers) {
      sanitized = sanitizer(sanitized);
    }

    // Apply validators
    for (const validator of this.validators) {
      if (!validator.test(sanitized)) {
        const error = new ValidationError(
          this.field,
          this.errorMessage || validator.message,
          'validation'
        );
        
        if (throwOnError) {
          throw error;
        }
        return { valid: false, error, value: sanitized };
      }
    }

    return { valid: true, value: sanitized, error: null };
  }
}

/**
 * Validation registry for reusable validators
 */
class ValidatorRegistry {
  constructor() {
    this.validators = new Map();
  }

  register(name, validatorBuilder) {
    this.validators.set(name, validatorBuilder);
    return this;
  }

  get(name) {
    return this.validators.get(name);
  }

  validate(name, value, throwOnError = true) {
    const validator = this.validators.get(name);
    if (!validator) {
      throw new Error(`Validator '${name}' not found in registry`);
    }
    return validator.validate(value, throwOnError);
  }

  has(name) {
    return this.validators.has(name);
  }
}

// Global validator registry
const validatorRegistry = new ValidatorRegistry();

/**
 * Format validators for common string formats
 */
const FormatValidators = {
  email(value) {
    const email = String(value).trim().toLowerCase();
    if (!PatternBuilder.email().test(email)) {
      throw new ValidationError('email', `Invalid email format: ${value}`, 'format');
    }
    return email;
  },

  url(value) {
    try {
      new URL(String(value));
      return String(value);
    } catch {
      throw new ValidationError('url', `Invalid URL format: ${value}`, 'format');
    }
  },

  uuid(value) {
    const uuid = String(value).trim().toLowerCase();
    if (!PatternBuilder.uuid().test(uuid)) {
      throw new ValidationError('uuid', `Invalid UUID format: ${value}`, 'format');
    }
    return uuid;
  },

  base64(value) {
    const base64 = String(value);
    if (base64.length % 4 !== 0 || !PatternBuilder.base64().test(base64)) {
      throw new ValidationError('base64', `Invalid base64 format: ${value}`, 'format');
    }
    return base64;
  },

  slug(value) {
    const slug = String(value).trim().toLowerCase();
    if (!PatternBuilder.slug().test(slug)) {
      throw new ValidationError('slug', `Invalid slug format: ${value}. Use lowercase letters, numbers, and hyphens.`, 'format');
    }
    return slug;
  },

  hex(value, length = 64) {
    const hex = String(value).trim().toLowerCase();
    const pattern = PatternBuilder.hex(length);
    if (!pattern.test(hex)) {
      throw new ValidationError('hex', `Invalid hex format: expected 0x${length} hex chars`, 'format');
    }
    return hex;
  }
};

/**
 * Numeric format validators
 */
const NumericValidators = {
  decimal(value, maxDecimals = 8) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ValidationError('number', `${value} is not a valid number`, 'numeric');
    }

    const parts = String(value).split('.');
    if (parts[1] && parts[1].length > maxDecimals) {
      throw new ValidationError('decimal', `Cannot exceed ${maxDecimals} decimal places`, 'numeric');
    }

    return num;
  },

  integer(value) {
    const num = parseInt(value, 10);
    if (isNaN(num) || String(num) !== String(value).trim()) {
      throw new ValidationError('integer', `${value} is not a valid integer`, 'numeric');
    }
    return num;
  },

  hex(value) {
    const hex = String(value).trim();
    const num = parseInt(hex, 16);
    if (isNaN(num)) {
      throw new ValidationError('hex', `${value} is not valid hexadecimal`, 'numeric');
    }
    return num;
  },

  scientific(value) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ValidationError('scientific', `${value} is not a valid number in scientific notation`, 'numeric');
    }
    return num;
  },

  positive(value, allowZero = false) {
    const num = parseFloat(value);
    if (isNaN(num) || num < 0 || (!allowZero && num === 0)) {
      throw new ValidationError('positive', `Value must be positive (> 0)`, 'numeric');
    }
    return num;
  }
};

/**
 * Type coercion utilities
 */
const TypeCoercion = {
  toBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return !['false', '0', '', 'null', 'undefined'].includes(value.toLowerCase());
    }
    return Boolean(value);
  },

  toNumber(value) {
    if (typeof value === 'number') return value;
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new ValidationError('number', `Cannot coerce ${value} to number`, 'coercion');
    }
    return num;
  },

  toInteger(value) {
    const num = this.toNumber(value);
    return Math.floor(num);
  },

  toString(value) {
    if (typeof value === 'string') return value;
    return String(value);
  },

  toArray(value) {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') return value.split(',').map(v => v.trim());
    return [value];
  },

  toDate(value) {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationError('date', `Cannot parse ${value} as date`, 'coercion');
    }
    return date;
  }
};

/**
 * Batch validator for validating multiple fields at once
 */
class BatchValidator {
  constructor(schema = {}) {
    this.schema = schema;
    this.errors = [];
    this.values = {};
  }

  addField(name, builder) {
    this.schema[name] = builder;
    return this;
  }

  validate(data) {
    this.errors = [];
    this.values = {};

    for (const [field, builder] of Object.entries(this.schema)) {
      const value = data[field];
      
      try {
        const result = builder.validate(value, false);
        
        if (!result.valid) {
          this.errors.push({
            field,
            message: result.error.message,
            rule: result.error.rule,
            context: result.error.context
          });
        } else {
          this.values[field] = result.value;
        }
      } catch (error) {
        if (error instanceof ValidationError) {
          this.errors.push({
            field,
            message: error.message,
            rule: error.rule,
            context: error.context
          });
        } else {
          throw error;
        }
      }
    }

    return {
      valid: this.errors.length === 0,
      values: this.values,
      errors: this.errors
    };
  }

  getErrors() {
    return this.errors;
  }

  hasErrors() {
    return this.errors.length > 0;
  }
}

/**
 * Helper function to create a new validator builder
 */
function createValidator(field) {
  return new ValidatorBuilder(field);
}

/**
 * Validate address format
 */
function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('address', 'Address must be a non-empty string');
  }

  if (!RULES.address.pattern.test(address)) {
    throw new ValidationError('address', RULES.address.description, 'address');
  }

  return address;
}

/**
 * Validate block identifier (number or hash)
 */
function validateBlock(block) {
  if (!block || (typeof block !== 'string' && typeof block !== 'number')) {
    throw new ValidationError('block', 'Block must be a string or number');
  }

  const blockStr = String(block).trim();

  // Try number format
  if (RULES.block.numberPattern.test(blockStr)) {
    const num = parseInt(blockStr, 10);
    if (num > RULES.block.maxNumber) {
      throw new ValidationError('block', `Block number cannot exceed ${RULES.block.maxNumber}`);
    }
    return blockStr;
  }

  // Try hash format
  if (RULES.block.hashPattern.test(blockStr)) {
    return blockStr;
  }

  throw new ValidationError('block', RULES.block.description, 'block');
}

/**
 * Validate transaction hash
 */
function validateTxHash(hash) {
  if (!hash || typeof hash !== 'string') {
    throw new ValidationError('txHash', 'Transaction hash must be a non-empty string');
  }

  if (!RULES.txHash.pattern.test(hash)) {
    throw new ValidationError('txHash', RULES.txHash.description, 'txHash');
  }

  return hash;
}

/**
 * Validate pagination parameters
 */
function validatePagination(limit, offset) {
  const lim = parseInt(limit, 10) || RULES.pagination.defaultLimit;
  const off = parseInt(offset, 10) || RULES.pagination.minOffset;

  if (isNaN(lim) || lim < RULES.pagination.minLimit) {
    throw new ValidationError('limit', `Limit must be at least ${RULES.pagination.minLimit}`);
  }

  if (lim > RULES.pagination.maxLimit) {
    throw new ValidationError('limit', `Limit cannot exceed ${RULES.pagination.maxLimit}`);
  }

  if (isNaN(off) || off < RULES.pagination.minOffset) {
    throw new ValidationError('offset', `Offset must be at least ${RULES.pagination.minOffset}`);
  }

  if (off > RULES.pagination.maxOffset) {
    throw new ValidationError('offset', `Offset cannot exceed ${RULES.pagination.maxOffset}`);
  }

  return { limit: lim, offset: off };
}

/**
 * Validate amount/balance
 */
function validateAmount(amount) {
  const num = parseFloat(amount);

  if (isNaN(num)) {
    throw new ValidationError('amount', 'Amount must be a valid number');
  }

  if (num < RULES.amount.minValue) {
    throw new ValidationError('amount', `Amount cannot be negative`);
  }

  if (num > RULES.amount.maxValue) {
    throw new ValidationError('amount', `Amount cannot exceed ${RULES.amount.maxValue}`);
  }

  return num;
}

/**
 * Validate filter parameter
 */
function validateFilter(filterObj) {
  if (!filterObj || typeof filterObj !== 'object') {
    throw new ValidationError('filter', 'Filter must be an object');
  }

  const keys = Object.keys(filterObj);
  if (keys.length > RULES.filters.maxFilterCount) {
    throw new ValidationError('filter', `Cannot have more than ${RULES.filters.maxFilterCount} filters`);
  }

  for (const [key, value] of Object.entries(filterObj)) {
    if (typeof value === 'string' && value.length > RULES.filters.maxFieldLength) {
      throw new ValidationError(`filter.${key}`, `Value exceeds maximum length of ${RULES.filters.maxFieldLength}`);
    }
  }

  return filterObj;
}

/**
 * Validate status value
 */
function validateStatus(status) {
  if (!RULES.filters.allowedStatuses.includes(status)) {
    throw new ValidationError('status', `Status must be one of: ${RULES.filters.allowedStatuses.join(', ')}`);
  }
  return status;
}

/**
 * Export all validation utilities
 */
module.exports = {
  // Core exports (backward compatible)
  RULES,
  ValidationError,
  validateAddress,
  validateBlock,
  validateTxHash,
  validatePagination,
  validateAmount,
  validateFilter,
  validateStatus,

  // New advanced features
  PatternBuilder,
  FormatValidators,
  NumericValidators,
  TypeCoercion,
  ValidatorBuilder,
  ValidatorRegistry,
  BatchValidator,
  createValidator,
  validatorRegistry
};
