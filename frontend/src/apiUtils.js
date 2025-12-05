/**
 * API error handling and client utilities
 *
 * Provides:
 * - ApiError: Custom error class for API failures
 * - ApiClient: Unified API communication class with request/response interceptors
 * - Error message mapping with user-friendly messages
 */

/**
 * Custom error class for API failures
 */
export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Determine if error is retryable
   */
  isRetryable() {
    // Retry on network errors (status 0) and server errors (5xx)
    return this.status === 0 || (this.status >= 500 && this.status < 600);
  }

  /**
   * Determine if error is user's fault (4xx)
   */
  isClientError() {
    return this.status >= 400 && this.status < 500;
  }
}

/**
 * Unified API client for handling all API communication
 *
 * Features:
 * - Centralized request/response handling
 * - Automatic error handling and user-friendly messages
 * - Request abort capability
 * - Base URL management
 * - Default headers
 */
export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set base URL for all requests
   */
  setBaseUrl(url) {
    this.baseUrl = url;
    return this;
  }

  /**
   * Add default headers to all requests
   */
  setDefaultHeaders(headers) {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    return this;
  }

  /**
   * Build full URL from relative path
   */
  buildUrl(path) {
    if (path.startsWith('http')) {
      return path; // Absolute URL
    }
    return this.baseUrl + path;
  }

  /**
   * Make GET request
   */
  async get(url, options = {}) {
    return this.request(url, { ...options, method: 'GET' });
  }

  /**
   * Make POST request
   */
  async post(url, body, options = {}) {
    return this.request(url, { ...options, method: 'POST', body });
  }

  /**
   * Make PUT request
   */
  async put(url, body, options = {}) {
    return this.request(url, { ...options, method: 'PUT', body });
  }

  /**
   * Make DELETE request
   */
  async delete(url, options = {}) {
    return this.request(url, { ...options, method: 'DELETE' });
  }

  /**
   * Main request method with error handling
   */
  async request(url, options = {}) {
    const fullUrl = this.buildUrl(url);

    try {
      const fetchOptions = {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      };

      // Serialize body if it's an object
      if (fetchOptions.body && typeof fetchOptions.body === 'object') {
        fetchOptions.body = JSON.stringify(fetchOptions.body);
      }

      const response = await fetch(fullUrl, fetchOptions);
      let data;

      try {
        data = await response.json();
      } catch (e) {
        data = null;
      }

      if (!response.ok) {
        throw new ApiError(
          data?.error || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiError(
        'Network error or invalid response',
        0,
        { originalError: error.message }
      );
    }
  }
}

/**
 * Legacy fetchApi function for backwards compatibility
 */
export async function fetchApi(url, options = {}) {
  const client = new ApiClient();
  return client.request(url, options);
}

/**
 * Map API errors to user-friendly messages
 */
export function getErrorMessage(error) {
  if (error instanceof ApiError) {
    const statusMessages = {
      400: 'Invalid request parameters',
      401: 'Authentication required',
      403: 'Access denied',
      404: 'Resource not found',
      429: 'Too many requests. Please try again later',
      500: 'Server error. Please try again later',
      503: 'Service temporarily unavailable',
    };

    if (statusMessages[error.status]) {
      return statusMessages[error.status];
    }

    if (error.status >= 400 && error.status < 500) {
      return error.message || 'Request error';
    }

    if (error.status >= 500) {
      return 'Server error. Please try again later';
    }

    if (error.status === 0) {
      return 'Network error. Check your connection';
    }

    return error.message || 'An error occurred';
  }

  return 'An unexpected error occurred';
}
