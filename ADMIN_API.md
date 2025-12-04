# Admin API Endpoints

This document describes the administrative and debugging endpoints available in the Trident Network Explorer API.

## Endpoints

### Cache Statistics

**GET** `/api/v1/admin/cache/stats`

Returns statistics about the cache performance.

**Response:**
```json
{
  "total": 150,
  "active": 145,
  "expired": 5,
  "maxSize": 1000,
  "hits": 2340,
  "misses": 156,
  "hitRate": "93.75%"
}
```

**Fields:**
- `total`: Total number of cached entries
- `active`: Number of non-expired entries
- `expired`: Number of expired entries (will be cleaned up)
- `maxSize`: Maximum cache size
- `hits`: Number of cache hits
- `misses`: Number of cache misses
- `hitRate`: Cache hit rate percentage

---

### Clear Cache

**DELETE** `/api/v1/admin/cache`

Manually clears all cached entries. Useful for debugging or when you need to force fresh data.

**Response:**
```json
{
  "message": "Cache cleared successfully"
}
```

---

### System Metrics

**GET** `/api/v1/admin/metrics`

Returns API usage statistics and system metrics.

**Response:**
```json
{
  "totalRequests": 5432,
  "requestsByEndpoint": {
    "/v1/blocks/latest": 1234,
    "/v1/blocks": 876,
    "/v1/accounts/T...": 543
  },
  "startTime": 1234567890,
  "uptime": 3600,
  "requestsPerSecond": "1.51",
  "cacheStats": {
    "total": 150,
    "active": 145,
    "expired": 5,
    "maxSize": 1000,
    "hits": 2340,
    "misses": 156,
    "hitRate": "93.75%"
  }
}
```

**Fields:**
- `totalRequests`: Total number of API requests received
- `requestsByEndpoint`: Breakdown of requests per endpoint
- `startTime`: Server start timestamp
- `uptime`: Server uptime in seconds
- `requestsPerSecond`: Average requests per second
- `cacheStats`: Current cache statistics

---

## Usage Examples

### Check Cache Performance

```bash
curl http://localhost:4000/api/v1/admin/cache/stats
```

### Clear Cache

```bash
curl -X DELETE http://localhost:4000/api/v1/admin/cache
```

### View System Metrics

```bash
curl http://localhost:4000/api/v1/admin/metrics
```

---

## Security Considerations

⚠️ **Important**: These endpoints should be protected in production environments. Consider:

1. Adding authentication middleware
2. Restricting access by IP address
3. Using environment variables to enable/disable admin endpoints
4. Rate limiting these endpoints separately
5. Logging all admin endpoint access

Example protection (add to server.js):

```javascript
// Protect admin endpoints
app.use('/api/v1/admin', (req, res, next) => {
  const adminToken = req.headers['x-admin-token'];
  if (adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});
```

---

## Monitoring Tips

1. **Watch Cache Hit Rate**: A rate below 80% might indicate cache TTL needs adjustment
2. **Monitor Memory**: Check `active` entries don't approach `maxSize` too often
3. **Track Endpoints**: Use `requestsByEndpoint` to identify popular or problematic endpoints
4. **Performance**: Compare `requestsPerSecond` with cache hit rate to optimize

---

## Integration with Monitoring Tools

These endpoints can be integrated with monitoring tools like:

- **Prometheus**: Scrape metrics endpoint
- **Grafana**: Visualize cache performance over time
- **Datadog**: Track API performance
- **New Relic**: Monitor application health

Example Prometheus config:
```yaml
scrape_configs:
  - job_name: 'trident-explorer'
    static_configs:
      - targets: ['localhost:4000']
    metrics_path: '/api/v1/admin/metrics'
```
