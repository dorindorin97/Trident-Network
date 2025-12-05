/**
 * API response validation schemas
 * Ensures data integrity across all API endpoints
 */

class ValidationSchema {
  constructor(definition) {
    this.definition = definition;
  }

  /**
   * Validate data against schema
   */
  validate(data) {
    const errors = [];

    if (this.definition.type === 'array') {
      if (!Array.isArray(data)) {
        return { valid: false, errors: ['Expected array, got ' + typeof data] };
      }
      // Validate array items
      data.forEach((item, index) => {
        const itemErrors = this.validateObject(item, this.definition.items);
        itemErrors.forEach(err => errors.push(`[${index}] ${err}`));
      });
    } else {
      errors.push(...this.validateObject(data, this.definition));
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  validateObject(obj, schema) {
    const errors = [];

    for (const [key, spec] of Object.entries(schema.properties || {})) {
      const value = obj[key];
      const fieldErrors = this.validateField(value, spec, key);
      errors.push(...fieldErrors);
    }

    return errors;
  }

  validateField(value, spec, fieldName) {
    const errors = [];

    // Required check
    if (spec.required && (value === null || value === undefined)) {
      errors.push(`${fieldName} is required`);
      return errors;
    }

    if (value === null || value === undefined) {
      return errors;
    }

    // Type check
    if (spec.type && typeof value !== spec.type) {
      errors.push(`${fieldName} must be ${spec.type}, got ${typeof value}`);
      return errors;
    }

    // Min/max length for strings
    if (spec.minLength && value.length < spec.minLength) {
      errors.push(`${fieldName} must be at least ${spec.minLength} characters`);
    }

    if (spec.maxLength && value.length > spec.maxLength) {
      errors.push(`${fieldName} must not exceed ${spec.maxLength} characters`);
    }

    // Min/max for numbers
    if (spec.minimum !== undefined && value < spec.minimum) {
      errors.push(`${fieldName} must be at least ${spec.minimum}`);
    }

    if (spec.maximum !== undefined && value > spec.maximum) {
      errors.push(`${fieldName} must not exceed ${spec.maximum}`);
    }

    // Pattern match
    if (spec.pattern && !new RegExp(spec.pattern).test(value)) {
      errors.push(`${fieldName} does not match required pattern`);
    }

    // Enum values
    if (spec.enum && !spec.enum.includes(value)) {
      errors.push(`${fieldName} must be one of: ${spec.enum.join(', ')}`);
    }

    // Nested object validation
    if (spec.properties && typeof value === 'object') {
      const schema = new ValidationSchema({ properties: spec.properties });
      const nestedErrors = schema.validateObject(value, spec);
      nestedErrors.forEach(err => errors.push(`${fieldName}.${err}`));
    }

    // Array validation
    if (spec.items && Array.isArray(value)) {
      value.forEach((item, index) => {
        if (typeof item !== spec.items.type) {
          errors.push(`${fieldName}[${index}] must be ${spec.items.type}`);
        }
      });
    }

    return errors;
  }
}

/**
 * API Response Schemas
 */
const SCHEMAS = {
  // Validators response
  validators: new ValidationSchema({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        address: { type: 'string', required: true, minLength: 34, maxLength: 34 },
        name: { type: 'string' },
        publicKey: { type: 'string' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
        votingPower: { type: 'number', minimum: 0 },
        commission: { type: 'number', minimum: 0, maximum: 100 },
        uptime: { type: 'number', minimum: 0, maximum: 100 },
        website: { type: 'string' },
        identity: { type: 'string' },
        details: { type: 'string' }
      }
    }
  }),

  // Blocks response
  blocks: new ValidationSchema({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        height: { type: 'number', required: true, minimum: 0 },
        hash: { type: 'string', required: true },
        timestamp: { type: 'number', required: true },
        miner: { type: 'string' },
        transactions: { type: 'number', minimum: 0 },
        gasUsed: { type: 'number', minimum: 0 },
        gasLimit: { type: 'number', minimum: 0 }
      }
    }
  }),

  // Block detail response
  blockDetail: new ValidationSchema({
    properties: {
      height: { type: 'number', required: true },
      hash: { type: 'string', required: true },
      timestamp: { type: 'number', required: true },
      miner: { type: 'string' },
      transactions: { type: 'number', minimum: 0 },
      transactionList: {
        type: 'array',
        items: { type: 'object' }
      }
    }
  }),

  // Transactions response
  transactions: new ValidationSchema({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        hash: { type: 'string', required: true },
        from: { type: 'string' },
        to: { type: 'string' },
        value: { type: 'string' },
        block: { type: 'number' },
        timestamp: { type: 'number' },
        status: { type: 'string', enum: ['pending', 'confirmed', 'failed'] },
        gasUsed: { type: 'number', minimum: 0 },
        fee: { type: 'string' }
      }
    }
  }),

  // Account response
  account: new ValidationSchema({
    properties: {
      address: { type: 'string', required: true },
      balance: { type: 'string', required: true },
      nonce: { type: 'number', minimum: 0 },
      code: { type: 'string' },
      storage: { type: 'object' }
    }
  }),

  // Health check response
  health: new ValidationSchema({
    properties: {
      status: { type: 'string', required: true, enum: ['ok', 'degraded', 'error'] },
      timestamp: { type: 'number', required: true },
      uptime: { type: 'number', minimum: 0 },
      nodeVersion: { type: 'string' },
      chainId: { type: 'string' }
    }
  })
};

/**
 * Validate API response
 */
function validateResponse(data, schemaName) {
  const schema = SCHEMAS[schemaName];

  if (!schema) {
    console.warn(`Schema not found for ${schemaName}`);
    return { valid: true, errors: [] }; // Don't fail if schema not found
  }

  return schema.validate(data);
}

/**
 * Create response wrapper with validation
 */
function validateAndWrap(data, schemaName, includeValidation = false) {
  const validation = validateResponse(data, schemaName);

  const response = {
    data,
    valid: validation.valid,
    timestamp: Date.now()
  };

  if (includeValidation) {
    response.validation = validation;
  }

  return response;
}

module.exports = {
  ValidationSchema,
  SCHEMAS,
  validateResponse,
  validateAndWrap
};
