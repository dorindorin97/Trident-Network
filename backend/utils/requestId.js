const { randomBytes } = require('crypto');

// Middleware to add request ID for tracking
function requestId(req, res, next) {
  const id = req.headers['x-request-id'] || randomBytes(16).toString('hex');
  req.id = id;
  res.setHeader('X-Request-ID', id);
  next();
}

module.exports = requestId;
