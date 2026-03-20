/**
 * API Hooks - React hooks for common API operations
 * Reduces boilerplate in components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from './client';
import { useNotification } from '../context/AppContext';
import { captureException } from '../utils/errorTracker';

/**
 * Hook for fetching data
 */
export function useFetch(endpoint, options = {}) {
  const {
    skip = false,
    refetchInterval = null,
    cache = true,
    retries = 3
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);
  const refetchIntervalRef = useRef(null);

  const fetch = useCallback(async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get(endpoint, { cache, retries });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [endpoint, cache, retries, skip]);

  useEffect(() => {
    fetch();

    if (refetchInterval) {
      refetchIntervalRef.current = setInterval(fetch, refetchInterval);
    }

    return () => {
      if (refetchIntervalRef.current) {
        clearInterval(refetchIntervalRef.current);
      }
    };
  }, [fetch, refetchInterval]);

  return { data, loading, error, refetch: fetch };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation(endpoint, options = {}) {
  const { method = 'POST', onSuccess = null, onError = null } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);

      try {
        let response;
        if (method === 'GET') {
          response = await apiClient.get(endpoint);
        } else if (method === 'POST') {
          response = await apiClient.post(endpoint, payload);
        } else if (method === 'PUT') {
          response = await apiClient.put(endpoint, payload);
        } else if (method === 'DELETE') {
          response = await apiClient.delete(endpoint);
        }

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (err) {
        setError(err.message);
        if (onError) {
          onError(err);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, method, onSuccess, onError]
  );

  return { mutate, loading, error };
}

/**
 * Hook for paginated data
 */
export function usePagination(baseEndpoint, options = {}) {
  const {
    pageSize = 20,
    initialPage = 1,
    cache = false
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = `${baseEndpoint}?page=${currentPage}&limit=${pageSize}`;
        const response = await apiClient.get(endpoint, { cache });

        setData(response.data.items || response.data);
        setTotalPages(Math.ceil((response.data.total || 0) / pageSize));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [baseEndpoint, currentPage, pageSize, cache]);

  const nextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback((page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  }, [totalPages]);

  return {
    data,
    loading,
    error,
    currentPage,
    totalPages,
    nextPage,
    prevPage,
    goToPage
  };
}

/**
 * Hook for debounced search
 */
export function useSearch(onSearch, debounceMs = 500) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const debounceTimerRef = useRef(null);

  const handleSearch = useCallback(
    (searchQuery) => {
      setQuery(searchQuery);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setSearching(true);

      // Debounce search
      debounceTimerRef.current = setTimeout(async () => {
        try {
          const searchResults = await onSearch(searchQuery);
          setResults(searchResults);
        } finally {
          setSearching(false);
        }
      }, debounceMs);
    },
    [onSearch, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { query, results, searching, handleSearch };
}

/**
 * Hook for infinite scroll
 */
export function useInfiniteScroll(endpoint, options = {}) {
  const { pageSize = 20, threshold = 0.1 } = options;

  // Notification helper (use hooks from AppContext)
  const { error: notifyError } = useNotification();

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const observerRef = useRef(null);

  // Refs let the effect read current values without re-running on every state change,
  // preventing the cascade: load → state change → re-run → load → ...
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  useEffect(() => {
    const loadMore = async () => {
      if (loadingRef.current || !hasMoreRef.current) return;

      loadingRef.current = true;
      setLoading(true);

      try {
        const url = `${endpoint}?page=${page}&limit=${pageSize}`;
        const response = await apiClient.get(url);
        const items = response.data.items || response.data;

        setData(prev => {
          const next = [...prev, ...items];
          const totalItems = response.data.total || 0;
          hasMoreRef.current = next.length < totalItems;
          setHasMore(hasMoreRef.current);
          return next;
        });
      } catch (err) {
        notifyError?.(err.message || 'Failed to load more');
        captureException(err, { source: 'useInfiniteScroll' });
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    };

    loadMore();

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMoreRef.current && !loadingRef.current) {
          setPage(p => p + 1);
        }
      },
      { threshold }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  // Re-run only when the page advances or the endpoint/pageSize changes.
  // loading and hasMore are read via refs to avoid cascade re-runs.
  }, [endpoint, pageSize, page, threshold]);

  return {
    data,
    loading,
    hasMore,
    observerRef
  };
}

/**
 * Hook for API request abort/cancellation
 */
export function useAbortableFetch(endpoint, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(new AbortController());

  useEffect(() => {
    const controller = abortControllerRef.current;

    const fetchData = async () => {
      try {
        const response = await apiClient.get(endpoint, options);
        setData(response.data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, [endpoint, options]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { data, loading, error, cancel };
}

export default {
  useFetch,
  useMutation,
  usePagination,
  useSearch,
  useInfiniteScroll,
  useAbortableFetch
};
