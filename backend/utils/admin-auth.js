/**
 * Admin authentication middleware
 * Protects sensitive admin endpoints with authentication
 */

const logger = require('./logger');

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;

/**
 * Middleware to authenticate admin requests
 * Expects Authorization header: Bearer <token>
 */
function adminAuth(req, res, next) {
  // Admin token must be configured
  if (!ADMIN_TOKEN) {
    logger.warn('Admin endpoints accessed but ADMIN_TOKEN not configured', {
      path: req.path,
      ip: req.ip
    });
    return res.status(403).json({
      error: 'Admin endpoints not available - ADMIN_TOKEN not configured'
    });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('Admin endpoint accessed without auth header', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.warn('Admin endpoint accessed with invalid auth format', {
      path: req.path,
      ip: req.ip
    });
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }

  const token = parts[1];

  // Constant-time comparison to prevent timing attacks
  if (!constantTimeEqual(token, ADMIN_TOKEN)) {
    logger.warn('Admin endpoint accessed with invalid token', {
      path: req.path,
      ip: req.ip
    });
    return res.status(403).json({ error: 'Invalid authentication token' });
  }

  // Token is valid
  logger.debug('Admin auth successful', { path: req.path });
  next();
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Middleware to validate CSRF tokens for state-changing operations
 * Uses double-submit cookie pattern
 */
function csrfProtection(req, res, next) {
  // Only protect state-changing methods
  const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
  if (!protectedMethods.includes(req.method)) {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrfToken;

  if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
    logger.warn('CSRF validation failed', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }

  next();
}

module.exports = {
  adminAuth,
  csrfProtection
};
