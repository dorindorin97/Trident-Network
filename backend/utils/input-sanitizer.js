/**
 * Input Sanitization Middleware
 * Sanitizes all string inputs to prevent injection attacks
 * Removes/escapes dangerous characters from URL params, query strings, and body
 */

const logger = require('./logger');

class InputSanitizer {
  /**
   * Escape HTML special characters in string
   * @param {string} str - Input string
   * @returns {string} HTML-escaped string
   */
  escapeHtml(str) {
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
   * Sanitize strings: remove dangerous characters
   * @param {string} str - String to sanitize
   * @returns {string} Sanitized string
   */
  sanitizeString(str) {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .trim()
      .replace(/[<>"'`]/g, '') // Remove dangerous HTML/JS characters
      .replace(/[;{}]/g, '')     // Remove script delimiters
      .substring(0, 1000);       // Max length 1000 chars
  }

  /**
   * Sanitize object (recursively)
   * @param {object} obj - Object to sanitize
   * @param {number} depth - Current recursion depth (max 5)
   * @returns {object} Sanitized object
   */
  sanitizeObject(obj, depth = 0) {
    if (depth > 5) {
      logger.warn('Sanitization depth exceeded', { depth });
      return {};
    }

    if (typeof obj !== 'object' || obj === null) {
      return typeof obj === 'string' ? this.sanitizeString(obj) : obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item, depth + 1));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value, depth + 1);
    }
    return sanitized;
  }

  /**
   * Create sanitization middleware for request params/query
   * @param {boolean} sanitizeBody - Also sanitize request body (default: false)
   * @returns {Function} Express middleware
   */
  middleware(sanitizeBody = false) {
    return (req, res, next) => {
      try {
        // Sanitize URL params
        if (req.params && Object.keys(req.params).length > 0) {
          req.params = this.sanitizeObject(req.params);
        }

        // Sanitize query params
        if (req.query && Object.keys(req.query).length > 0) {
          req.query = this.sanitizeObject(req.query);
        }

        // Sanitize body if requested
        if (sanitizeBody && req.body) {
          req.body = this.sanitizeObject(req.body);
        }
      } catch (error) {
        logger.error('Sanitization error', { error: error.message });
        // Continue anyway, don't block request
      }

      next();
    };
  }

  /**
   * Validate and sanitize email
   * @param {string} email - Email to validate/sanitize
   * @returns {object} { valid: boolean, sanitized: string, error?: string }
   */
  sanitizeEmail(email) {
    const sanitized = this.sanitizeString(email).toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Invalid email format'
      };
    }

    return {
      valid: true,
      sanitized
    };
  }

  /**
   * Validate and sanitize URL
   * @param {string} url - URL to validate/sanitize
   * @returns {object} { valid: boolean, sanitized: string, error?: string }
   */
  sanitizeUrl(url) {
    const sanitized = this.sanitizeString(url);

    try {
      new URL(sanitized);
      return {
        valid: true,
        sanitized
      };
    } catch (error) {
      return {
        valid: false,
        sanitized: '',
        error: 'Invalid URL format'
      };
    }
  }

  /**
   * Validate and sanitize blockchain address
   * @param {string} address - Address to validate/sanitize
   * @returns {object} { valid: boolean, sanitized: string, error?: string }
   */
  sanitizeAddress(address) {
    const sanitized = this.sanitizeString(address);

    // Trident Network address format: T + 33 alphanumeric
    if (!/^T[a-zA-Z0-9]{33}$/.test(sanitized)) {
      return {
        valid: false,
        sanitized: '',
        error: 'Invalid blockchain address format'
      };
    }

    return {
      valid: true,
      sanitized
    };
  }

  /**
   * Validate and sanitize numeric input
   * @param {string|number} value - Value to validate
   * @param {object} options - Validation options
   * @returns {object} { valid: boolean, sanitized: number, error?: string }
   */
  sanitizeNumber(value, options = {}) {
    const { min = -Infinity, max = Infinity, integer = false } = options;

    const num = Number(value);

    if (isNaN(num)) {
      return {
        valid: false,
        sanitized: null,
        error: 'Not a valid number'
      };
    }

    if (integer && !Number.isInteger(num)) {
      return {
        valid: false,
        sanitized: null,
        error: 'Must be an integer'
      };
    }

    if (num < min || num > max) {
      return {
        valid: false,
        sanitized: null,
        error: `Must be between ${min} and ${max}`
      };
    }

    return {
      valid: true,
      sanitized: num
    };
  }
}

module.exports = new InputSanitizer();
