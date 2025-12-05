/**
 * Custom hook for managing localStorage state
 * Automatically syncs state with localStorage
 */

import { useState, useCallback } from 'react';

/**
 * Hook for managing localStorage state
 * @param {string} key - localStorage key
 * @param {*} initialValue - Initial value if key doesn't exist
 * @returns {Array} [value, setValue] - Similar to useState
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // localStorage write failed, value stored in memory only
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
