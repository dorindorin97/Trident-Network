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

/**
 * Validates environment configuration
 * @throws {Error} If critical environment variables are missing or invalid
 * @returns {object} Validation result with warnings and errors
 */
import { captureMessage, captureException } from './utils/errorTracker';

export function validateEnv() {
  const warnings = [];
  const errors = [];

  // Validate REFRESH_INTERVAL
  if (isNaN(REFRESH_INTERVAL) || REFRESH_INTERVAL < 1000) {
    warnings.push('REACT_APP_REFRESH_INTERVAL is invalid or too low, using default (10000ms)');
  }

  // Validate THEME
  const validThemes = ['dark', 'light', 'auto'];
  if (!validThemes.includes(DEFAULT_THEME)) {
    warnings.push(`REACT_APP_DEFAULT_THEME is invalid, using default (dark)`);
  }

  // Validate LANGUAGE
  const validLanguages = ['en', 'es', 'pt'];
  if (!validLanguages.includes(DEFAULT_LANGUAGE)) {
    warnings.push(`REACT_APP_DEFAULT_LANGUAGE is invalid, using default (en)`);
  }

  // Validate BACKEND_URL in production
  if (process.env.NODE_ENV === 'production' && !process.env.REACT_APP_BACKEND_URL) {
    errors.push('REACT_APP_BACKEND_URL must be set in production environment');
  }

  return { warnings, errors };
}

// Validate environment configuration on app startup
try {
  const validation = validateEnv();

  if (validation.errors.length > 0) {
    const errorMsg = `Configuration errors:\n${validation.errors.map(e => `- ${e}`).join('\n')}`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(errorMsg);
    } else {
      try {
        captureException(new Error(errorMsg), { source: 'config.validateEnv' });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(`[Config Error] ${errorMsg}`);
      }
    }
  }

  if (validation.warnings.length > 0 && process.env.NODE_ENV === 'development') {
    validation.warnings.forEach(warning => {
      try {
        captureMessage(`[Config Info] ${warning}`, 'info', { source: 'config.validateEnv' });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.info(`[Config Info] ${warning}`);
      }
    });
  }
} catch (err) {
  if (process.env.NODE_ENV === 'production') {
    throw err;
  }
}
