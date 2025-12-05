/**
 * Centralized validation rules for Trident Network
 * Used by both backend validators and frontend components
 */

const RULES = {
  // Address validation
  address: {
    pattern: /^T[a-zA-Z0-9]{33}$/,
    minLength: 34,
    maxLength: 34,
    description: 'Address must start with T and be 34 characters'
  },

  // Block number/hash validation
  block: {
    numberPattern: /^\d+$/,
    hashPattern: /^0x[a-fA-F0-9]{64}$/,
    maxNumber: 999999999,
    description: 'Block must be a number or 0x-prefixed hash'
  },

  // Transaction hash validation
  txHash: {
    pattern: /^0x[a-fA-F0-9]{64}$/,
    description: 'Transaction hash must be 0x-prefixed 64-char hex'
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
    maxDecimals: 8
  },

  // Filters
  filters: {
    maxFieldLength: 256,
    maxFilterCount: 10,
    allowedStatuses: ['pending', 'confirmed', 'failed', 'active', 'inactive']
  }
};

class ValidationError extends Error {
  constructor(field, message, rule) {
    super(`${field}: ${message}`);
    this.field = field;
    this.rule = rule;
    this.name = 'ValidationError';
  }
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

module.exports = {
  RULES,
  ValidationError,
  validateAddress,
  validateBlock,
  validateTxHash,
  validatePagination,
  validateAmount,
  validateFilter,
  validateStatus
};
