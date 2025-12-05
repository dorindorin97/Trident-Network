const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const http = require('http');
const SimpleCache = require('./utils/cache');
const logger = require('./utils/logger');
const requestId = require('./utils/requestId');
const { retryWithBackoff } = require('./utils/retry');
const WebSocketManager = require('./utils/websocket');
const { validateBackendEnv } = require('./utils/env-validator');
const InputSanitizer = require('./utils/input-sanitizer');
const HttpCacheMiddleware = require('./utils/http-cache-middleware');
const RequestLoggerMiddleware = require('./utils/request-logger-middleware');
const { adminAuth } = require('./utils/admin-auth');

const app = express();

// Validate environment variables early
let envConfig;
try {
  envConfig = validateBackendEnv();
} catch (error) {
  logger.error('Environment validation failed:', error.message);
  process.exit(1);
}

const PORT = envConfig.PORT;
const CHAIN_MODE = process.env.CHAIN_MODE;
const TRIDENT_NODE_RPC_URL = process.env.TRIDENT_NODE_RPC_URL;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Initialize cache with 5s TTL for latest blocks, 30s for others
const cache = new SimpleCache();
const cleanupInterval = cache.startCleanup();

// Request metrics
const metrics = {
  totalRequests: 0,
  requestsByEndpoint: {},
  startTime: Date.now()
};

app.use(helmet());
app.use(compression()); // Enable gzip compression
app.use(requestId);
app.use(logger.requestLogger); // Log all requests/responses
app.use(RequestLoggerMiddleware.middleware(false)); // Request metrics (verbose=false)

// Sanitize all incoming inputs
app.use(InputSanitizer.middleware());

// Track metrics
app.use('/api', (req, res, next) => {
  metrics.totalRequests++;
  const endpoint = req.path;
  metrics.requestsByEndpoint[endpoint] = (metrics.requestsByEndpoint[endpoint] || 0) + 1;
  next();
});

const allowedOrigins = FRONTEND_URL ? FRONTEND_URL.split(',') : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Add intelligent caching headers middleware
app.use('/api', HttpCacheMiddleware.cacheMiddleware(30)); // 30s TTL for GET requests

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
    // Wrap fetch in retry logic
    const data = await retryWithBackoff(async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const resp = await fetch(url, { 
        signal: controller.signal,
        headers: { 
          'Accept': 'application/json',
          'Connection': 'keep-alive' // Enable connection pooling
        }
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
      
      return await resp.json();
    }, 2, 500); // Max 2 retries with 500ms base delay
    
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

// Admin/Debug endpoints - Protected with authentication
app.get('/api/v1/admin/cache/stats', adminAuth, (req, res) => {
  const stats = cache.getStats();
  res.json(stats);
});

app.delete('/api/v1/admin/cache', adminAuth, (req, res) => {
  cache.clear();
  logger.info('Cache cleared manually', { requestId: req.id });
  res.json({ message: 'Cache cleared successfully' });
});

app.get('/api/v1/admin/metrics', adminAuth, (req, res) => {
  const uptime = Date.now() - metrics.startTime;
  res.json({
    ...metrics,
    uptime: Math.floor(uptime / 1000),
    requestsPerSecond: (metrics.totalRequests / (uptime / 1000)).toFixed(2),
    cacheStats: cache.getStats(),
    requestLoggerMetrics: RequestLoggerMiddleware.getMetrics(),
    httpCacheMetrics: HttpCacheMiddleware.getStats()
  });
});

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
  const server = http.createServer(app);
  
  // Initialize WebSocket
  const wsManager = new WebSocketManager(server);
  
  // Make wsManager available to routes via app.locals
  app.locals.wsManager = wsManager;
  
  server.listen(PORT, () => {
    logger.info(`Trident Network API server started`, { 
      port: PORT, 
      mode: CHAIN_MODE,
      rpcUrl: TRIDENT_NODE_RPC_URL 
    });
  });
  
  // Graceful shutdown
  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    wsManager.close();
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
