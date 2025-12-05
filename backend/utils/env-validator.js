/**
 * Comprehensive environment variable validation for both backend and frontend
 * Ensures all required variables are set and valid
 */

const logger = require('./logger');

/**
 * Backend environment configuration with validation
 */
const BACKEND_ENV_SCHEMA = {
  PORT: {
    type: 'number',
    default: 4000,
    validate: (val) => val > 0 && val < 65536,
    error: 'PORT must be a valid port number (1-65535)'
  },
  NODE_ENV: {
    type: 'string',
    default: 'development',
    validate: (val) => ['development', 'production', 'test'].includes(val),
    error: 'NODE_ENV must be development, production, or test'
  },
  CHAIN_MODE: {
    type: 'string',
    required: true,
    validate: (val) => val === 'rpc',
    error: 'CHAIN_MODE must be "rpc"'
  },
  TRIDENT_NODE_RPC_URL: {
    type: 'string',
    required: true,
    validate: (val) => /^https?:\/\/.+/.test(val),
    error: 'TRIDENT_NODE_RPC_URL must be a valid HTTP/HTTPS URL'
  },
  FRONTEND_URL: {
    type: 'string',
    default: 'http://localhost:3000',
    validate: (val) => /^https?:\/\/.+/.test(val) || val === 'http://localhost:3000',
    error: 'FRONTEND_URL must be a valid HTTP/HTTPS URL'
  },
  LOG_LEVEL: {
    type: 'string',
    default: 'info',
    validate: (val) => ['debug', 'info', 'warn', 'error'].includes(val),
    error: 'LOG_LEVEL must be debug, info, warn, or error'
  },
  ENABLE_CACHE: {
    type: 'boolean',
    default: true,
    validate: (val) => typeof val === 'boolean',
    error: 'ENABLE_CACHE must be true or false'
  },
  CACHE_MAX_SIZE: {
    type: 'number',
    default: 1000,
    validate: (val) => val > 0 && val < 1000000,
    error: 'CACHE_MAX_SIZE must be between 1 and 999999'
  },
  ENABLE_COMPRESSION: {
    type: 'boolean',
    default: true,
    validate: (val) => typeof val === 'boolean',
    error: 'ENABLE_COMPRESSION must be true or false'
  }
};

/**
 * Frontend environment configuration with validation
 */
const FRONTEND_ENV_SCHEMA = {
  REACT_APP_BACKEND_URL: {
    type: 'string',
    required: true,
    validate: (val) => /^https?:\/\/.+/.test(val),
    error: 'REACT_APP_BACKEND_URL must be a valid HTTP/HTTPS URL'
  },
  REACT_APP_APP_TITLE: {
    type: 'string',
    default: 'Trident Explorer',
    validate: (val) => val.length > 0 && val.length < 100,
    error: 'REACT_APP_APP_TITLE must be 1-99 characters'
  },
  REACT_APP_DEFAULT_THEME: {
    type: 'string',
    default: 'dark',
    validate: (val) => ['dark', 'light'].includes(val),
    error: 'REACT_APP_DEFAULT_THEME must be dark or light'
  },
  REACT_APP_DEFAULT_LANGUAGE: {
    type: 'string',
    default: 'en',
    validate: (val) => ['en', 'es', 'pt'].includes(val),
    error: 'REACT_APP_DEFAULT_LANGUAGE must be en, es, or pt'
  }
};

/**
 * Parse and validate environment value
 */
function parseEnvValue(value, expectedType) {
  if (expectedType === 'boolean') {
    return value === 'true' || value === '1' || value === true;
  }
  if (expectedType === 'number') {
    const num = parseInt(value, 10);
    return isNaN(num) ? null : num;
  }
  return value;
}

/**
 * Validate environment variables against schema
 */
function validateEnvironment(schema, env = process.env, source = 'backend') {
  const errors = [];
  const warnings = [];
  const config = {};

  for (const [key, spec] of Object.entries(schema)) {
    const value = env[key];

    // Check if required
    if (spec.required && !value) {
      errors.push(`❌ ${key} is required but not set`);
      continue;
    }

    // Use default if not provided
    if (!value) {
      config[key] = spec.default;
      if (spec.default === undefined) {
        warnings.push(`⚠️  ${key} not set, no default available`);
      } else {
        logger.info(`Using default for ${key}:`, { value: spec.default });
      }
      continue;
    }

    // Parse and validate
    const parsed = parseEnvValue(value, spec.type);

    if (parsed === null && spec.type === 'number') {
      errors.push(`❌ ${key} must be a number, got "${value}"`);
      continue;
    }

    if (spec.validate && !spec.validate(parsed)) {
      errors.push(`❌ ${key}: ${spec.error} (got "${value}")`);
      continue;
    }

    config[key] = parsed;
  }

  return { config, errors, warnings };
}

/**
 * Initialize and validate backend environment
 */
function validateBackendEnv() {
  const { config, errors, warnings } = validateEnvironment(BACKEND_ENV_SCHEMA);

  if (errors.length > 0) {
    logger.error('❌ Environment validation failed:');
    errors.forEach(err => logger.error(err));
    throw new Error('Invalid environment configuration');
  }

  if (warnings.length > 0) {
    logger.warn('⚠️  Environment warnings:');
    warnings.forEach(warn => logger.warn(warn));
  }

  return config;
}

/**
 * Initialize and validate frontend environment (for build-time)
 */
function validateFrontendEnv() {
  const { config, errors, warnings } = validateEnvironment(FRONTEND_ENV_SCHEMA, process.env, 'frontend');

  if (errors.length > 0) {
    console.error('❌ Frontend environment validation failed:');
    errors.forEach(err => console.error(err));
    throw new Error('Invalid frontend environment configuration');
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Frontend environment warnings:');
    warnings.forEach(warn => console.warn(warn));
  }

  return config;
}

/**
 * Get environment documentation
 */
function getEnvDocumentation(schema) {
  let doc = '# Environment Variables\n\n';

  for (const [key, spec] of Object.entries(schema)) {
    doc += `## ${key}\n`;
    doc += `- **Type**: ${spec.type}\n`;
    doc += `- **Required**: ${spec.required ? 'Yes' : 'No'}\n`;

    if (spec.default !== undefined) {
      doc += `- **Default**: ${spec.default}\n`;
    }

    doc += `- **Description**: ${spec.error}\n\n`;
  }

  return doc;
}

module.exports = {
  BACKEND_ENV_SCHEMA,
  FRONTEND_ENV_SCHEMA,
  validateEnvironment,
  validateBackendEnv,
  validateFrontendEnv,
  getEnvDocumentation
};
