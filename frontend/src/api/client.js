/**
 * API Client - Centralized API communication with caching and retry logic
 * Reduces code duplication in components
 */

import { API_BASE_PATH } from '../config';

class APIClient {
  constructor(baseURL = API_BASE_PATH) {
    this.baseURL = baseURL;
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.defaultTimeout = 10000;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const {
      method = 'GET',
      body = null,
      headers = {},
      timeout = this.defaultTimeout,
      cache = true,
      retries = this.retryAttempts,
      cacheKey = `${method}:${endpoint}`
    } = options;

    // Check cache for GET requests
    if (cache && method === 'GET' && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check if request is already pending (deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create request promise
    const requestPromise = this._executeRequest(endpoint, {
      method,
      body,
      headers,
      timeout,
      retries
    });

    // Store pending request
    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;

      // Cache successful GET responses
      if (cache && method === 'GET') {
        this.cache.set(cacheKey, response);
      }

      return response;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute request with retries
   */
  async _executeRequest(endpoint, options, attempt = 1) {
    const { method, body, headers, timeout, retries } = options;
    const url = `${this.baseURL}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        body: body ? JSON.stringify(body) : null,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`);
        error.status = response.status;
        error.response = response;

        // Retry on 5xx errors or network timeouts
        if ((response.status >= 500 || response.status === 0) && attempt <= retries) {
          await this._delay(this.retryDelay * attempt);
          return this._executeRequest(endpoint, options, attempt + 1);
        }

        throw error;
      }

      const data = await response.json();
      return { data, status: response.status, ok: true };
    } catch (error) {
      clearTimeout(timeoutId);

      // Retry on network errors
      if (error.name === 'AbortError' || error.message === 'Failed to fetch') {
        if (attempt <= retries) {
          await this._delay(this.retryDelay * attempt);
          return this._executeRequest(endpoint, options, attempt + 1);
        }
      }

      throw error;
    }
  }

  /**
   * Delay utility
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body, cache: false });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body, cache: false });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE', cache: false });
  }

  /**
   * Batch requests
   */
  async batch(requests) {
    return Promise.all(
      requests.map(req => this.request(req.endpoint, req.options))
    );
  }

  /**
   * Clear cache
   */
  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    // Clear cache entries matching pattern
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    };
  }

  /**
   * Set custom headers
   */
  setHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }
}

// Export singleton instance
const apiClient = new APIClient();

export default apiClient;
