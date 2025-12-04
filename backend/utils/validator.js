// Input validation and sanitization utilities
const validator = {
  // Validate and sanitize address
  isValidAddress(addr) {
    return typeof addr === 'string' && /^T[a-zA-Z0-9]{39}$/.test(addr);
  },

  // Validate block number
  isValidBlockNumber(n) {
    if (typeof n !== 'string' || !/^\d+$/.test(n)) {
      return false;
    }
    const num = parseInt(n, 10);
    return Number.isInteger(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
  },

  // Validate block hash (64 hex characters = 32 bytes)
  isValidBlockHash(hash) {
    return typeof hash === 'string' && /^0x[0-9a-fA-F]{64}$/.test(hash);
  },

  // Validate transaction ID
  isValidTxId(id) {
    return typeof id === 'string' && /^(0x)?[0-9a-fA-F]{64}$/.test(id);
  },

  // Validate pagination parameters
  validatePagination(page, limit, maxLimit = 100) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    
    // If non-numeric strings are provided, reject them
    if ((page !== undefined && page !== null && isNaN(parsedPage)) ||
        (limit !== undefined && limit !== null && isNaN(parsedLimit))) {
      return { valid: false, error: 'Invalid pagination parameters' };
    }
    
    const p = Math.max(1, parsedPage || 1);
    const l = Math.min(maxLimit, Math.max(1, parsedLimit || 10));
    
    return { valid: true, page: p, limit: l };
  },

  // Sanitize string input (basic XSS prevention)
  sanitizeString(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLength).trim();
  }
};

module.exports = validator;
