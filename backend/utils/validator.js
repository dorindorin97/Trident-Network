// Input validation and sanitization utilities
const validator = {
  // Validate and sanitize address
  isValidAddress(addr) {
    return typeof addr === 'string' && /^T[a-zA-Z0-9]{39}$/.test(addr);
  },

  // Validate block number
  isValidBlockNumber(n) {
    const num = parseInt(n, 10);
    return Number.isInteger(num) && num >= 0 && num <= Number.MAX_SAFE_INTEGER;
  },

  // Validate block hash
  isValidBlockHash(hash) {
    return typeof hash === 'string' && /^0x[0-9a-fA-F]{16}$/.test(hash);
  },

  // Validate transaction ID
  isValidTxId(id) {
    return typeof id === 'string' && /^(0x)?[0-9a-fA-F]{64}$/.test(id);
  },

  // Validate pagination parameters
  validatePagination(page, limit, maxLimit = 100) {
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(maxLimit, Math.max(1, parseInt(limit, 10) || 10));
    
    if (isNaN(p) || isNaN(l)) {
      return { valid: false, error: 'Invalid pagination parameters' };
    }
    
    return { valid: true, page: p, limit: l };
  },

  // Sanitize string input (basic XSS prevention)
  sanitizeString(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLength).trim();
  }
};

module.exports = validator;
