/**
 * Retry utility for RPC calls with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds for exponential backoff
 * @returns {Promise} Result of the function or throws error
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx) or if it's the last attempt
      const statusMatch = error.message && error.message.match(/:\s*(\d{3})/);
      const statusCode = statusMatch ? parseInt(statusMatch[1], 10) : null;
      if (attempt === maxRetries || (statusCode && statusCode >= 400 && statusCode < 500)) {
        throw error;
      }
      
      // Exponential backoff: wait 1s, 2s, 4s, etc.
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}

module.exports = { retryWithBackoff };
