/**
 * Custom hook for simplified data fetching
 * Wrapper around useApi with common defaults
 */

import { useEffect, useState, useCallback } from 'react';

/**
 * Hook for fetching data
 * @param {Function} fetchFn - Async function to execute
 * @param {Object} options - Configuration options
 * @param {*} options.initialData - Initial data value
 * @param {Array} options.deps - Dependency array
 * @returns {Object} {data, loading, error, refetch}
 */
export function useFetch(fetchFn, options = {}) {
  const { initialData = null, deps = [fetchFn] } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    refetch();
  }, deps);

  return { data, loading, error, refetch };
}

export default useFetch;
