import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing pagination state and logic
 * Handles page, limit, and offset calculations
 * @param {number} defaultLimit - Default items per page (default: 20)
 * @param {number} maxLimit - Maximum items per page (default: 100)
 * @returns {object} Pagination state and handlers
 */
export function usePagination(defaultLimit = 20, maxLimit = 100) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(defaultLimit);

  // Calculate offset
  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  // Go to page
  const goToPage = useCallback((newPage) => {
    const pageNum = Math.max(1, Math.floor(newPage));
    setPage(pageNum);
  }, []);

  // Change limit
  const changeLimit = useCallback((newLimit) => {
    const limitNum = Math.min(maxLimit, Math.max(1, Math.floor(newLimit)));
    setLimit(limitNum);
    setPage(1); // Reset to first page when limit changes
  }, [maxLimit]);

  // Next page
  const nextPage = useCallback((totalPages) => {
    if (page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [page]);

  // Previous page
  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  // Reset pagination
  const reset = useCallback(() => {
    setPage(1);
    setLimit(defaultLimit);
  }, [defaultLimit]);

  // Calculate pagination info
  const getPaginationInfo = useCallback((total) => {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      offset,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      start: offset + 1,
      end: Math.min(offset + limit, total)
    };
  }, [page, limit, offset]);

  return {
    page,
    limit,
    offset,
    goToPage,
    changeLimit,
    nextPage,
    prevPage,
    reset,
    getPaginationInfo,
    setPage,
    setLimit
  };
}

export default usePagination;
