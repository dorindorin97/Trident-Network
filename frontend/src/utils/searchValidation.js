/**
 * Search validation and navigation utilities
 * Handles validation of search queries and navigation logic
 */

import { PATTERNS } from '../config';

/**
 * Detect search type based on query pattern
 * @param {string} query - Search query string
 * @param {string} preferredType - Preferred type if 'all' is selected
 * @returns {object} { type, isValid, error }
 */
export function detectSearchType(query, preferredType = 'all') {
  if (!query || !query.trim()) {
    return { type: null, isValid: false, error: 'Please enter a search query' };
  }

  let type = preferredType;

  if (type === 'all') {
    if (PATTERNS.BLOCK_NUMBER.test(query)) {
      type = 'block';
    } else if (PATTERNS.TX_ID.test(query)) {
      type = 'transaction';
    } else if (PATTERNS.ADDRESS.test(query)) {
      type = 'account';
    } else if (PATTERNS.BLOCK_HASH.test(query)) {
      type = 'block';
    } else {
      return { type: null, isValid: false, error: 'Invalid search query format' };
    }
  } else {
    // Validate against specific type
    const isValid = validateQueryByType(query, type);
    if (!isValid) {
      const errorMap = {
        block: 'Invalid block number or hash',
        transaction: 'Invalid transaction ID',
        account: 'Invalid account address'
      };
      return { type: null, isValid: false, error: errorMap[type] || 'Invalid search query' };
    }
  }

  return { type, isValid: true, error: null };
}

/**
 * Validate query against a specific search type
 * @param {string} query - Query to validate
 * @param {string} type - Search type (block, transaction, account)
 * @returns {boolean} True if valid
 */
export function validateQueryByType(query, type) {
  switch (type) {
    case 'block':
      return PATTERNS.BLOCK_NUMBER.test(query) || PATTERNS.BLOCK_HASH.test(query);
    case 'transaction':
      return PATTERNS.TX_ID.test(query);
    case 'account':
      return PATTERNS.ADDRESS.test(query);
    default:
      return false;
  }
}

/**
 * Get navigation path for search result
 * @param {string} type - Search type
 * @param {string} query - Search query
 * @returns {string|null} Navigation path or null if invalid
 */
export function getNavigationPath(type, query) {
  if (!validateQueryByType(query, type)) {
    return null;
  }

  switch (type) {
    case 'block':
      return `/block/${query}`;
    case 'transaction':
      return `/tx/${query}`;
    case 'account':
      return `/account/${query}`;
    default:
      return null;
  }
}
