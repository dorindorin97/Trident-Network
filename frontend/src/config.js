// Frontend configuration constants

// API Configuration
export const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
export const API_VERSION = 'v1';
export const API_BASE_PATH = `${API_URL}/api/${API_VERSION}`;

// App Configuration
export const APP_TITLE = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';
export const THEME_COLOR = process.env.REACT_APP_THEME_COLOR || '#001730';
export const DEFAULT_LANGUAGE = process.env.REACT_APP_DEFAULT_LANGUAGE || 'en';
export const DEFAULT_THEME = process.env.REACT_APP_DEFAULT_THEME || 'dark';
export const REFRESH_INTERVAL = parseInt(process.env.REACT_APP_REFRESH_INTERVAL || '10000', 10);

// Validation Patterns
export const PATTERNS = {
  ADDRESS: /^T[a-zA-Z0-9]{39}$/,
  BLOCK_HASH: /^0x[0-9a-fA-F]{64}$/,
  TX_ID: /^(0x)?[0-9a-fA-F]{64}$/,
  BLOCK_NUMBER: /^\d+$/,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Network Configuration
export const NETWORK = {
  CHAIN_ID: '0x76a81b116bfaa26e',
  BLOCK_TIME: 2000, // milliseconds
  CONSENSUS: 'Modified BFT Proof-of-Stake',
};

// Validation helpers
export function validateEnv() {
  const warnings = [];
  
  if (!process.env.REACT_APP_BACKEND_URL) {
    warnings.push('REACT_APP_BACKEND_URL not set, using default');
  }
  
  if (isNaN(REFRESH_INTERVAL) || REFRESH_INTERVAL < 1000) {
    warnings.push('REACT_APP_REFRESH_INTERVAL invalid, using default');
  }
  
  return warnings;
}

// Log environment warnings in development
if (process.env.NODE_ENV === 'development') {
  const warnings = validateEnv();
  warnings.forEach(warning => console.warn(`[Config Warning] ${warning}`));
}
