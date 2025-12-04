const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const SimpleCache = require('./utils/cache');
const logger = require('./utils/logger');
const requestId = require('./utils/requestId');
const { sanitizeInput } = require('./utils/sanitize');

const app = express();
const PORT = process.env.PORT || 4000;
const CHAIN_MODE = process.env.CHAIN_MODE;
const TRIDENT_NODE_RPC_URL = process.env.TRIDENT_NODE_RPC_URL || '';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize cache with 5s TTL for latest blocks, 30s for others
const cache = new SimpleCache();
const cleanupInterval = cache.startCleanup();

if (CHAIN_MODE !== 'rpc') {
  logger.error('CHAIN_MODE must be "rpc"');
  process.exit(1);
}

if (!TRIDENT_NODE_RPC_URL) {
  logger.error('TRIDENT_NODE_RPC_URL is required');
  process.exit(1);
}

if (!TRIDENT_NODE_RPC_URL.startsWith('http://') && !TRIDENT_NODE_RPC_URL.startsWith('https://')) {
  logger.error('TRIDENT_NODE_RPC_URL must start with http:// or https://');
  process.exit(1);
}

app.use(helmet());
app.use(requestId);
const allowedOrigins = FRONTEND_URL ? FRONTEND_URL.split(',') : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Content-type validation for POST/PUT/PATCH requests
app.use('/api', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({ error: 'Content-Type must be application/json' });
    }
  }
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(sanitizeInput);
app.use(express.static(path.join(__dirname, 'public')));

async function fetchRpc(endpoint) {
  // Validate endpoint to prevent SSRF attacks
  if (!endpoint || typeof endpoint !== 'string') {
    throw new Error('Invalid endpoint');
  }
  
  if (endpoint.includes('..') || endpoint.includes('//')) {
    throw new Error('Invalid endpoint format');
  }

  const cacheKey = `rpc:${endpoint}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug('Cache hit', { endpoint });
    return cached;
  }

  const url = `${TRIDENT_NODE_RPC_URL}${endpoint}`;
  logger.debug('RPC request', { url });
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
    
    const resp = await fetch(url, { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    
    clearTimeout(timeoutId);
    
    if (!resp.ok) {
      logger.error('RPC request failed', { url, status: resp.status });
      throw new Error(`RPC request failed: ${resp.status}`);
    }
    
    const contentType = resp.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Invalid response content type');
    }
    
    const data = await resp.json();
    
    // Cache with different TTLs based on endpoint
    const ttl = endpoint.includes('/latest') ? 5000 : 30000;
    cache.set(cacheKey, data, ttl);
    logger.debug('Cached response', { endpoint, ttl });
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      logger.error('RPC request timeout', { url });
      throw new Error('Request timeout');
    }
    throw error;
  }
}

// routes
app.use('/api', require('./routes/health'));
app.use('/api', require('./routes/blocks')(fetchRpc));
app.use('/api', require('./routes/transactions')(fetchRpc));
app.use('/api', require('./routes/accounts')(fetchRpc));
app.use('/api', require('./routes/validators')(fetchRpc));

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack, path: req.path });
  res.status(500).json({ error: 'Internal server error' });
});

if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Trident Network API server started`, { 
      port: PORT, 
      mode: CHAIN_MODE,
      rpcUrl: TRIDENT_NODE_RPC_URL 
    });
  });
  
  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('Server closed');
      if (cleanupInterval) {
        clearInterval(cleanupInterval);
      }
      cache.clear();
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = app;
