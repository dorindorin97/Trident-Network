/**
 * Request deduplication manager
 * Prevents duplicate concurrent API requests by returning cached promises
 * Useful for eliminating redundant RPC calls
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
  }

  /**
   * Generate cache key from function and arguments
   */
  generateKey(fn, args) {
    const fnName = fn.name || 'anonymous';
    const argsStr = JSON.stringify(args);
    return `${fnName}:${argsStr}`;
  }

  /**
   * Execute function with deduplication
   * If same request is already in flight, return the same promise
   */
  async deduplicate(fn, args = []) {
    const key = this.generateKey(fn, args);

    // Return existing promise if request is in flight
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Create new request promise
    const promise = (async () => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        throw error;
      } finally {
        // Clean up after request completes
        this.pendingRequests.delete(key);
      }
    })();

    // Store promise while it's in flight
    this.pendingRequests.set(key, promise);
    return promise;
  }

  /**
   * Get number of pending requests
   */
  getPendingCount() {
    return this.pendingRequests.size;
  }

  /**
   * Get all pending request keys
   */
  getPendingRequests() {
    return Array.from(this.pendingRequests.keys());
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.pendingRequests.clear();
  }

  /**
   * Create a deduplicating wrapper for a function
   */
  createWrapper(fn) {
    return (...args) => this.deduplicate(fn, args);
  }
}

module.exports = RequestDeduplicator;
