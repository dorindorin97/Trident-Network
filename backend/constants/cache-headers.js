/**
 * Cache Header Constants
 * Standardized cache-control headers for different endpoint types
 */

const CACHE_HEADERS = {
  // Latest/Real-time data - 5 second cache
  LATEST_DATA: {
    'Cache-Control': 'public, max-age=5, stale-while-revalidate=10'
  },
  // Stable data - 30 second cache
  STABLE_DATA: {
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=60'
  },
  // Active/Medium-change data - 60 second cache
  ACTIVE_DATA: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=120'
  },
  // Health/Status data - 10 second cache
  HEALTH_DATA: {
    'Cache-Control': 'public, max-age=10, stale-while-revalidate=20'
  },
  // No cache
  NO_CACHE: {
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  }
};

/**
 * Set cache headers on response
 * @param {object} res - Express response object
 * @param {string} cacheType - Type of cache (e.g., 'LATEST_DATA', 'STABLE_DATA')
 */
function setCacheHeaders(res, cacheType = 'STABLE_DATA') {
  const headers = CACHE_HEADERS[cacheType] || CACHE_HEADERS.STABLE_DATA;
  Object.entries(headers).forEach(([key, value]) => {
    res.set(key, value);
  });
}

module.exports = {
  CACHE_HEADERS,
  setCacheHeaders
};
