// Input sanitization middleware
const validator = require('./validator');

/**
 * Sanitize string by escaping HTML special characters
 * @param {string} str - Input string
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  
  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return str.replace(/[&<>"'/]/g, char => htmlEscapeMap[char]);
}

/**
 * Recursively sanitize object properties
 * @param {any} obj - Object to sanitize
 * @param {number} maxDepth - Maximum recursion depth
 * @returns {any} Sanitized object
 */
function sanitizeObject(obj, maxDepth = 5) {
  if (maxDepth <= 0) return obj;
  
  if (typeof obj === 'string') {
    return validator.sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, maxDepth - 1));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value, maxDepth - 1);
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware to sanitize request query parameters and body
 */
function sanitizeInput(req, res, next) {
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  next();
}

module.exports = { sanitizeInput, escapeHtml, sanitizeObject };
