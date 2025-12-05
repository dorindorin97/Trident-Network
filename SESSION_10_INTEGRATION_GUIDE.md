# Session 10: Backend Integration Guide

**Purpose:** Detailed guide to the new backend utilities and how they integrate with existing code

---

## 📋 Table of Contents

1. [New Utilities Overview](#new-utilities-overview)
2. [Integration Architecture](#integration-architecture)
3. [Usage Examples](#usage-examples)
4. [Middleware Stack](#middleware-stack)
5. [Troubleshooting](#troubleshooting)
6. [Performance Tuning](#performance-tuning)

---

## New Utilities Overview

### Quick Reference

| Utility | File | Purpose | Export |
|---------|------|---------|--------|
| HttpCacheMiddleware | `backend/utils/http-cache-middleware.js` | HTTP-level caching with ETag | Singleton instance |
| RequestLoggerMiddleware | `backend/utils/request-logger-middleware.js` | Request metrics collection | Singleton instance |
| ConditionalCacheDecorator | `backend/utils/conditional-cache.js` | Endpoint-level caching | Singleton instance |
| InputSanitizer | `backend/utils/input-sanitizer.js` | Input validation/sanitization | Singleton instance |

### Import Pattern

All utilities use the singleton pattern:

```javascript
// All utilities export a ready-to-use instance
const HttpCacheMiddleware = require('./utils/http-cache-middleware');
const RequestLoggerMiddleware = require('./utils/request-logger-middleware');
const ConditionalCacheDecorator = require('./utils/conditional-cache');
const InputSanitizer = require('./utils/input-sanitizer');

// Use directly (no instantiation needed)
app.use(InputSanitizer.middleware());
```

---

## Integration Architecture

### Middleware Execution Order

```
┌─────────────────────────────────────────────────────────┐
│ Request arrives from client                             │
└────────────────┬────────────────────────────────────────┘
                 │
        ┌────────▼────────┐
        │ helmet()        │ ← Security headers
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ compression()   │ ← Gzip encoding
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ requestId       │ ← Request tracking
        └────────┬────────┘
                 │
        ┌────────▼──────────────────────┐
        │ RequestLoggerMiddleware       │ ← Start metrics timer
        └────────┬─────────────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ InputSanitizer.middleware()   │ ← Sanitize inputs
        └────────┬─────────────────────┘
                 │
        ┌────────▼────────┐
        │ cors()          │ ← Handle CORS
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │ rateLimit()     │ ← Rate limiting
        └────────┬────────┘
                 │
        ┌────────▼────────────────┐
        │ express.json()          │ ← Parse JSON body
        └────────┬────────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ HttpCacheMiddleware           │ ← HTTP caching (GET requests)
        └────────┬─────────────────────┘
                 │
        ┌────────▼────────────┐
        │ Route Handler       │ ← Your route logic
        └────────┬────────────┘
                 │
        ┌────────▼──────────────────────┐
        │ RequestLoggerMiddleware       │ ← End metrics timer, log
        └────────┬─────────────────────┘
                 │
        ┌────────▼────────────────┐
        │ Response sent to client │
        └─────────────────────────┘
```

### Data Flow with Caching

```
Client Request
    │
    ├─ GET /api/v1/blocks/latest?noCache=true
    │   │
    │   └─ HttpCacheMiddleware checks: noCache param present → bypass cache
    │       │
    │       └─ ConditionalCacheDecorator checks: noCache=true → don't use cache
    │           │
    │           └─ Route handler executes → fetchRpc()
    │               │
    │               └─ Response: X-Cache: BYPASS (skipped cache)
    │
    ├─ GET /api/v1/blocks/latest (no params)
    │   │
    │   └─ HttpCacheMiddleware checks: GET request → apply cache
    │       │
    │       └─ If fresh cached response available:
    │           Response: HTTP 304 (Not Modified) - No bandwidth used
    │       │
    │       └─ If cache expired:
    │           Route handler executes → fetchRpc()
    │           │
    │           └─ Response with ETag header
    │               Response: X-Cache: MISS (cache miss, served fresh)
```

---

## Usage Examples

### 1. HttpCacheMiddleware

#### Basic Setup in server.js
```javascript
const HttpCacheMiddleware = require('./utils/http-cache-middleware');

// Apply to all /api routes with 30s default TTL
app.use('/api', HttpCacheMiddleware.cacheMiddleware(30));
```

#### In Route Handlers
```javascript
router.get('/v1/blocks/latest', async (req, res) => {
  // Override default cache with endpoint-specific setting
  res.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
  return res.json(data);
});
```

#### Invalidation
```javascript
// Clear specific cache entries matching pattern
HttpCacheMiddleware.invalidate('/blocks/');

// Clear all cache
HttpCacheMiddleware.clear();

// Check cache stats
const stats = HttpCacheMiddleware.getStats();
console.log(stats); // { hits: 245, misses: 52, evictions: 0 }
```

---

### 2. RequestLoggerMiddleware

#### Setup in server.js
```javascript
const RequestLoggerMiddleware = require('./utils/request-logger-middleware');

// Add middleware (verbose=false for production, true for debugging)
app.use(RequestLoggerMiddleware.middleware(false));
```

#### Getting Metrics
```javascript
// In metrics endpoint or monitoring
app.get('/api/v1/admin/metrics', (req, res) => {
  const metrics = RequestLoggerMiddleware.getMetrics();
  
  res.json({
    globalMetrics: {
      totalRequests: metrics.totalRequests,
      totalErrors: metrics.totalErrors,
      avgResponseTime: metrics.totalDuration / metrics.totalRequests,
      errorRate: (metrics.totalErrors / metrics.totalRequests * 100).toFixed(2)
    },
    
    endpointMetrics: RequestLoggerMiddleware.getEndpointMetrics(),
    
    statusCodeDistribution: metrics.byStatusCode
  });
});
```

#### Example Metrics Output
```javascript
{
  totalRequests: 5230,
  totalErrors: 23,
  totalDuration: 285000,      // milliseconds
  totalBytes: 12450000,       // bytes sent
  
  byEndpoint: {
    "/v1/blocks/latest": {
      count: 1200,
      avgDuration: 45,        // ms
      totalBytes: 3600000,
      errorCount: 2
    },
    "/v1/accounts": {
      count: 800,
      avgDuration: 120,
      totalBytes: 4000000,
      errorCount: 5
    }
  },
  
  byStatusCode: {
    200: 5145,
    304: 45,   // Not Modified (from caching)
    400: 10,
    404: 15,
    503: 15
  }
}
```

---

### 3. ConditionalCacheDecorator

#### Creating a Cached Handler
```javascript
const ConditionalCacheDecorator = require('./utils/conditional-cache');

// In route file initialization
const accountCacheDecorator = new ConditionalCacheDecorator.wrap(
  async (address) => {
    return fetchRpc(`/accounts/${address}`);
  },
  { 
    ttl: 30,                    // 30 second TTL
    keyGenerator: (args) => `account:${args[0]}`  // Optional custom key
  }
);

// In route handler
router.get('/v1/accounts/:address', async (req, res) => {
  const address = req.params.address;
  
  // This will use cache if available, or call fetchRpc()
  const data = await accountCacheDecorator(address);
  
  // Cache behavior is controlled by query params:
  // /v1/accounts/T123           → Uses cache (X-Cache: HIT)
  // /v1/accounts/T123?noCache   → Bypasses cache (X-Cache: BYPASS)
  
  res.json(data);
});
```

#### Cache Invalidation
```javascript
// Invalidate specific patterns when data changes
router.post('/v1/accounts/:address/transfer', async (req, res) => {
  // ... handle request ...
  
  // Clear cached account data when it changes
  ConditionalCacheDecorator.invalidatePattern(`account:${req.params.address}`);
  
  return res.json(result);
});

// Clear all cache patterns
ConditionalCacheDecorator.clearAll();
```

#### Cache Stats
```javascript
const stats = ConditionalCacheDecorator.getStats();
console.log(stats);
// {
//   totalHits: 1245,
//   totalMisses: 310,
//   hitRate: 80.07,
//   currentSize: 45,
//   memoryUsage: 2048576
// }
```

---

### 4. InputSanitizer

#### Automatic Request Sanitization
```javascript
// In server.js - applied globally to all routes
app.use(InputSanitizer.middleware());

// Now all incoming request bodies are automatically sanitized:
// POST /api/v1/accounts
// {
//   "name": "<script>alert('xss')</script>",
//   "email": "test@example.com"
// }
//
// Becomes:
// {
//   "name": "scriptalertxssscript",
//   "email": "test@example.com"
// }
```

#### Specific Sanitization Functions
```javascript
const InputSanitizer = require('./utils/input-sanitizer');

// Sanitize strings (removes dangerous chars)
const clean = InputSanitizer.sanitizeString("<h1>Hello</h1>");
// Result: "h1Helloh1"

// Sanitize email
const email = InputSanitizer.sanitizeEmail("test+tag@example.com");
// Result: "test+tag@example.com" (validated format)

// Sanitize URL
const url = InputSanitizer.sanitizeUrl("https://example.com/path?query=value");
// Result: "https://example.com/path?query=value" (validated)

// Sanitize blockchain address
const address = InputSanitizer.sanitizeAddress("T1234567890");
// Result: "T1234567890" (validated format)

// Sanitize number with range
try {
  const num = InputSanitizer.sanitizeNumber("150", 0, 100);
} catch (e) {
  console.log(e.message); // "Value 150 is outside range [0, 100]"
}

// Recursively sanitize object
const dirty = {
  user: "<script>alert</script>",
  nested: {
    comment: "<img src=x onerror=alert(1)>"
  }
};

const clean = InputSanitizer.sanitizeObject(dirty);
// Result: {
//   user: "scriptalertscript",
//   nested: {
//     comment: "img srcx onerroralert1"
//   }
// }
```

---

## Middleware Stack

### Current Stack (server.js)

```javascript
// Security and encoding
app.use(helmet());
app.use(compression());

// Request tracking
app.use(requestId);
app.use(logger.requestLogger);

// NEW: Metrics collection
app.use(RequestLoggerMiddleware.middleware(false));

// NEW: Input sanitization
app.use(InputSanitizer.middleware());

// Cross-origin and rate limiting
const allowedOrigins = FRONTEND_URL ? FRONTEND_URL.split(',') : [];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// NEW: HTTP caching
app.use('/api', HttpCacheMiddleware.cacheMiddleware(30));

// Routes
app.use('/api/v1/accounts', require('./routes/accounts')(fetchRpc));
app.use('/api/v1/blocks', require('./routes/blocks')(fetchRpc));
// ... more routes
```

### Middleware Considerations

#### Why this order?

1. **helmet/compression first** - Low-level HTTP optimization
2. **requestId early** - Need tracking ID available to all middleware
3. **RequestLogger early** - Start timing before everything else
4. **InputSanitizer before routes** - Protect downstream handlers
5. **HttpCacheMiddleware last** - Cache the final response format

#### Adding Custom Middleware

If you need to add custom middleware:

```javascript
// GOOD: Add after InputSanitizer
app.use(customAuthMiddleware);
app.use('/api', customValidationMiddleware);

// BAD: These would break request tracking
// (Don't add before RequestLoggerMiddleware)

// GOOD: Add before routes
app.use('/api', myCustomMiddleware);

// Then routes
app.use('/api/v1/accounts', accountRoutes);
```

---

## Troubleshooting

### Issue: Cache not working (always MISS)

**Cause:** Cache is being bypassed

**Solutions:**
```javascript
// 1. Check query parameters
console.log(req.query); // If ?noCache=true, cache is bypassed

// 2. Check Cache-Control headers from route
res.set('Cache-Control', 'no-cache');  // ← This disables cache!

// 3. Check HTTP method
if (req.method !== 'GET') {
  // Cache is only for GET requests
}

// 4. Check if ETag matches
console.log(req.headers['if-none-match']); // If set, client has cached copy
```

### Issue: Memory usage growing (cache bloat)

**Solutions:**
```javascript
// 1. Clear cache periodically
setInterval(() => {
  HttpCacheMiddleware.clear();
  ConditionalCacheDecorator.clearAll();
}, 60 * 60 * 1000); // Every hour

// 2. Reduce TTL values
app.use('/api', HttpCacheMiddleware.cacheMiddleware(10)); // Lower TTL

// 3. Monitor cache size
const stats = HttpCacheMiddleware.getStats();
if (stats.currentSize > 1000000) { // 1MB
  HttpCacheMiddleware.clear();
}

// 4. Clear specific patterns (better than full clear)
HttpCacheMiddleware.invalidate('/accounts/');
```

### Issue: Sanitization removing valid data

**Problem:** Legitimate characters being removed

**Solutions:**
```javascript
// Option 1: Use specific sanitizers instead of generic
const email = InputSanitizer.sanitizeEmail(userEmail);
const url = InputSanitizer.sanitizeUrl(userUrl);

// Option 2: Bypass global sanitization for specific routes
app.post('/api/v1/raw-data', (req, res) => {
  // Already sanitized by middleware, but you can re-process
  const sanitized = InputSanitizer.sanitizeString(req.body.data);
  // ...
});

// Option 3: Pre-sanitize before sending data
// (Less preferred - sanitize on receipt is better)
```

### Issue: Metrics endpoint slow / high memory

**Solutions:**
```javascript
// 1. Reduce metric collection verbosity
app.use(RequestLoggerMiddleware.middleware(false)); // Not verbose

// 2. Export and reset metrics periodically
const metrics = RequestLoggerMiddleware.getMetrics();
// Send to monitoring system
RequestLoggerMiddleware.reset();

// 3. Sample requests instead of tracking all
// (Modify RequestLoggerMiddleware if needed)

// 4. Query specific endpoint metrics only
const endpointStats = RequestLoggerMiddleware.getEndpointMetrics();
```

---

## Performance Tuning

### Cache TTL Guidelines

```javascript
// Very volatile data (updates often)
res.set('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
// Examples: /blocks/latest, current price feeds

// Stable data (changes rarely)
res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
// Examples: /validators, /blocks/{id}, /transactions/{id}

// Immutable data (never changes)
res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=7200');
// Examples: /blocks/0, genesis block

// No cache (sensitive data)
res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
// Examples: User-specific data, real-time data
```

### Request Logger Tuning

```javascript
// Production: minimal logging
app.use(RequestLoggerMiddleware.middleware(false));

// Development: verbose logging
app.use(RequestLoggerMiddleware.middleware(true));

// Monitoring: export metrics periodically
setInterval(() => {
  const metrics = RequestLoggerMiddleware.getMetrics();
  
  // Send to Prometheus/DataDog/etc
  submitMetrics(metrics);
  
  // Reset counters
  RequestLoggerMiddleware.reset();
}, 60 * 1000); // Every minute
```

### Input Sanitization Tuning

```javascript
// Current limits (in input-sanitizer.js):
const MAX_STRING_LENGTH = 1000;          // Max 1000 chars per string
const MAX_RECURSION_DEPTH = 5;          // Max 5 nested levels
const DANGEROUS_CHARS = '<>\"\'`;{}';   // Characters to remove

// To modify, edit input-sanitizer.js and rebuild
// Or create a custom sanitizer:

class CustomSanitizer {
  static sanitizeString(str, maxLen = 2000) {
    // Custom implementation
  }
}
```

### Cache Size Monitoring

```javascript
// Monitor cache usage
setInterval(() => {
  const cacheStats = HttpCacheMiddleware.getStats();
  
  if (cacheStats.currentSize > 10 * 1024 * 1024) { // > 10MB
    console.warn('Cache size exceeding threshold');
    HttpCacheMiddleware.clear();
  }
  
  console.log(`Cache Hit Rate: ${cacheStats.hitRate}%`);
}, 5 * 60 * 1000); // Every 5 minutes
```

---

## 📊 Metrics Export Format

All endpoints now report via `/api/v1/admin/metrics`:

```json
{
  "totalRequests": 5230,
  "requestsByEndpoint": {
    "/v1/blocks": 1500,
    "/v1/accounts": 1200,
    "/v1/transactions": 900,
    "/v1/validators": 800,
    "/health": 830
  },
  "startTime": 1701777600000,
  "uptime": 185400,
  "requestsPerSecond": "28.18",
  "cacheStats": {
    "hits": 2100,
    "misses": 600,
    "hitRate": 77.78
  },
  "requestLoggerMetrics": {
    "totalRequests": 5230,
    "totalErrors": 15,
    "totalDuration": 285000,
    "totalBytes": 12450000,
    "byEndpoint": { /* detailed per-endpoint stats */ },
    "byStatusCode": { /* distribution by status code */ }
  },
  "httpCacheMetrics": {
    "hits": 2100,
    "misses": 600,
    "currentSize": 5242880,
    "itemCount": 234
  },
  "deduplicationStats": {
    "pendingRequests": 3
  }
}
```

---

## ✅ Verification Checklist

Use this checklist to verify all integrations are working:

- [ ] Server starts without errors
- [ ] `/api/v1/admin/metrics` returns metrics data
- [ ] GET requests return `X-Cache` header
- [ ] Repeated requests show `X-Cache: HIT` (or `BYPASS` if `?noCache=true`)
- [ ] Invalid inputs are sanitized (check logs)
- [ ] Error responses use ERROR_CODES format
- [ ] Request logger metrics increment on each request
- [ ] Cache invalidation works with `?noCache=true` param
- [ ] All 5 routes work and return data
- [ ] No errors in console on normal operation

---

## 📚 Related Documentation

- [SESSION_10_SUMMARY.md](./SESSION_10_SUMMARY.md) - Overall session summary
- [SESSION_9_VALIDATION_GUIDE.md](./SESSION_9_VALIDATION_GUIDE.md) - ValidationRules usage
- [backend/utils/](./backend/utils/) - All utility files with JSDoc

---

**Integration Guide Complete** ✅
