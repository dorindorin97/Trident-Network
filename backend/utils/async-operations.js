/**
 * Async Operation Manager - Handle concurrent async operations safely
 * Provides cancellation, timeouts, and error recovery
 */

const logger = require('./logger');

/**
 * Manages a pool of async operations with limits
 */
class AsyncOperationPool {
  constructor(maxConcurrent = 5, timeout = 30000) {
    this.maxConcurrent = maxConcurrent;
    this.timeout = timeout;
    this.operations = new Map();
    this.queue = [];
    this.activeCount = 0;
  }

  /**
   * Add operation to pool
   */
  async add(name, asyncFn) {
    const operationId = `${name}-${Date.now()}-${Math.random()}`;

    return new Promise((resolve, reject) => {
      const task = { operationId, name, asyncFn, resolve, reject };

      // If at capacity, queue the task
      if (this.activeCount >= this.maxConcurrent) {
        this.queue.push(task);
        logger.debug(`Operation queued: ${name}`, { queue_length: this.queue.length });
        return;
      }

      this._executeTask(task);
    });
  }

  /**
   * Execute a task
   */
  async _executeTask(task) {
    this.activeCount++;
    this.operations.set(task.operationId, task);

    let timeoutId;

    try {
      // Set timeout
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(
          () => reject(new Error(`Operation timeout: ${task.name}`)),
          this.timeout
        );
      });

      // Race between operation and timeout
      const result = await Promise.race([
        task.asyncFn(),
        timeoutPromise
      ]);

      clearTimeout(timeoutId);
      task.resolve(result);

      logger.debug(`Operation completed: ${task.name}`, { operationId: task.operationId });
    } catch (error) {
      clearTimeout(timeoutId);
      logger.error(`Operation failed: ${task.name}`, { 
        operationId: task.operationId, 
        error: error.message 
      });
      task.reject(error);
    } finally {
      this.operations.delete(task.operationId);
      this.activeCount--;

      // Process queue
      if (this.queue.length > 0) {
        const nextTask = this.queue.shift();
        this._executeTask(nextTask);
      }
    }
  }

  /**
   * Cancel operation
   */
  cancel(operationId) {
    if (this.operations.has(operationId)) {
      const task = this.operations.get(operationId);
      task.reject(new Error('Operation cancelled'));
      this.operations.delete(operationId);
      this.activeCount--;
    }
  }

  /**
   * Cancel all operations
   */
  cancelAll() {
    for (const [, task] of this.operations) {
      task.reject(new Error('All operations cancelled'));
    }
    this.operations.clear();
    this.queue = [];
    this.activeCount = 0;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      active: this.activeCount,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      utilization: ((this.activeCount / this.maxConcurrent) * 100).toFixed(2) + '%'
    };
  }
}

/**
 * Retry with exponential backoff
 */
async function retryAsync(asyncFn, options = {}) {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 30000,
    backoffMultiplier = 2,
    shouldRetry = () => true
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        delay,
        error: error.message
      });

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));

      // Calculate next delay
      delay = Math.min(delay * backoffMultiplier, maxDelay);
    }
  }

  throw lastError;
}

/**
 * Run async function with timeout
 */
function withTimeout(asyncFn, timeoutMs = 5000, timeoutMessage = 'Operation timed out') {
  return Promise.race([
    asyncFn(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
}

/**
 * Debounced async function
 */
function debounceAsync(asyncFn, delayMs = 300) {
  let timeoutId;
  // lastPromise was unused; removed to avoid linter warnings

  return function(...args) {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await asyncFn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs);
    });
  };
}

/**
 * Throttled async function
 */
function throttleAsync(asyncFn, minIntervalMs = 1000) {
  let lastCallTime = 0;
  // lastPromise was unused; removed to avoid linter warnings

  return function(...args) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime;

      const execute = async () => {
        try {
          lastCallTime = Date.now();
          const result = await asyncFn(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      if (timeSinceLastCall >= minIntervalMs) {
        execute();
      } else {
        setTimeout(execute, minIntervalMs - timeSinceLastCall);
      }
    });
  };
}

/**
 * Batch async operations with size limit
 */
async function batchAsync(items, asyncFn, batchSize = 10) {
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, index) => 
        asyncFn(item, i + index).catch(err => ({ error: err, item }))
      )
    );
    results.push(...batchResults);
  }

  return results;
}

/**
 * Run async functions in series (one after another)
 */
async function seriesAsync(asyncFns) {
  const results = [];

  for (const asyncFn of asyncFns) {
    const result = await asyncFn();
    results.push(result);
  }

  return results;
}

/**
 * Run async functions in parallel with concurrency limit
 */
async function parallelAsync(asyncFns, concurrency = 3) {
  const results = new Array(asyncFns.length);
  let currentIndex = 0;

  const worker = async () => {
    while (currentIndex < asyncFns.length) {
      const index = currentIndex++;
      results[index] = await asyncFns[index]();
    }
  };

  const workers = Array(Math.min(concurrency, asyncFns.length))
    .fill(null)
    .map(() => worker());

  await Promise.all(workers);

  return results;
}

/**
 * Memoize async function result
 */
function memoizeAsync(asyncFn, options = {}) {
  const { ttl = 60000, keyGenerator = (...args) => JSON.stringify(args) } = options;

  const cache = new Map();

  return async function(...args) {
    const key = keyGenerator(...args);

    if (cache.has(key)) {
      const { value, expireTime } = cache.get(key);
      if (Date.now() < expireTime) {
        return value;
      }
      cache.delete(key);
    }

    const value = await asyncFn(...args);
    cache.set(key, {
      value,
      expireTime: Date.now() + ttl
    });

    return value;
  };
}

module.exports = {
  AsyncOperationPool,
  retryAsync,
  withTimeout,
  debounceAsync,
  throttleAsync,
  batchAsync,
  seriesAsync,
  parallelAsync,
  memoizeAsync
};
