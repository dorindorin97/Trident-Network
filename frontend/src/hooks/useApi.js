import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchApi, getErrorMessage } from '../apiUtils';

/**
 * Custom hook for making API requests with loading and error states
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @returns {object} { data, loading, error, refetch }
 */
export function useApi(url, options = {}, immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  // Use ref to store options to avoid dependency issues
  const optionsRef = useRef(options);
  
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const fetchData = useCallback(async () => {
    if (!url) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchApi(url, optionsRef.current);
      setData(result);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Custom hook for polling API endpoints at regular intervals
 * @param {string} url - API endpoint URL
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 * @returns {object} { data, loading, error }
 */
export function usePolling(url, interval = 10000, enabled = true) {
  const { data, loading, error, refetch } = useApi(url, {}, enabled);

  useEffect(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      refetch();
    }, interval);

    return () => clearInterval(intervalId);
  }, [enabled, interval, refetch]);

  return { data, loading, error };
}
