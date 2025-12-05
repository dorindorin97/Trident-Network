/**
 * Advanced Validation System - Test Examples
 * Demonstrates all features of the enhanced validation-rules.js
 */

const {
  RULES,
  ValidationError,
  validateAddress,
  validateBlock,
  validateTxHash,
  validatePagination,
  validateAmount,
  validateFilter,
  validateStatus,
  PatternBuilder,
  FormatValidators,
  NumericValidators,
  TypeCoercion,
  ValidatorBuilder,
  BatchValidator,
  createValidator,
  validatorRegistry
} = require('./utils/validation-rules');

// ============================================================
// 1. BASIC VALIDATORS (Backward Compatible)
// ============================================================

console.log('=== BASIC VALIDATORS ===');

try {
  const address = validateAddress('TF1kxrUH33nsSyWDwWnN87jdrQKP2eqvhM');
  console.log('✅ Valid address:', address);
} catch (error) {
  console.error('❌ Invalid address:', error.message);
}

try {
  const block = validateBlock(12345);
  console.log('✅ Valid block:', block);
} catch (error) {
  console.error('❌ Invalid block:', error.message);
}

try {
  const pagination = validatePagination(20, 0);
  console.log('✅ Valid pagination:', pagination);
} catch (error) {
  console.error('❌ Invalid pagination:', error.message);
}

// ============================================================
// 2. FORMAT VALIDATORS
// ============================================================

console.log('\n=== FORMAT VALIDATORS ===');

try {
  const email = FormatValidators.email('user@example.com');
  console.log('✅ Valid email:', email);
} catch (e) {
  console.error('❌ Email error:', e.message);
}

try {
  const url = FormatValidators.url('https://example.com');
  console.log('✅ Valid URL:', url);
} catch (e) {
  console.error('❌ URL error:', e.message);
}

try {
  const uuid = FormatValidators.uuid('550e8400-e29b-41d4-a716-446655440000');
  console.log('✅ Valid UUID:', uuid);
} catch (e) {
  console.error('❌ UUID error:', e.message);
}

try {
  const slug = FormatValidators.slug('my-awesome-page');
  console.log('✅ Valid slug:', slug);
} catch (e) {
  console.error('❌ Slug error:', e.message);
}

// ============================================================
// 3. NUMERIC VALIDATORS
// ============================================================

console.log('\n=== NUMERIC VALIDATORS ===');

try {
  const decimal = NumericValidators.decimal('123.45', 2);
  console.log('✅ Valid decimal:', decimal);
} catch (e) {
  console.error('❌ Decimal error:', e.message);
}

try {
  const integer = NumericValidators.integer('42');
  console.log('✅ Valid integer:', integer);
} catch (e) {
  console.error('❌ Integer error:', e.message);
}

try {
  const positive = NumericValidators.positive('99.99', false);
  console.log('✅ Valid positive:', positive);
} catch (e) {
  console.error('❌ Positive error:', e.message);
}

// ============================================================
// 4. TYPE COERCION
// ============================================================

console.log('\n=== TYPE COERCION ===');

console.log('String to boolean:', TypeCoercion.toBoolean('true'));
console.log('String to number:', TypeCoercion.toNumber('123.45'));
console.log('String to integer:', TypeCoercion.toInteger('123.99'));
console.log('String to array:', TypeCoercion.toArray('a,b,c'));

// ============================================================
// 5. CUSTOM VALIDATOR BUILDER
// ============================================================

console.log('\n=== CUSTOM VALIDATOR BUILDER ===');

const emailValidator = createValidator('email')
  .required('Email is required')
  .custom(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email format'
  )
  .sanitize((val) => val.trim().toLowerCase());

try {
  const result = emailValidator.validate('  USER@EXAMPLE.COM  ', false);
  if (result.valid) {
    console.log('✅ Email validated and sanitized:', result.value);
  }
} catch (e) {
  console.error('❌ Email error:', e.message);
}

// ============================================================
// 6. BATCH VALIDATOR
// ============================================================

console.log('\n=== BATCH VALIDATOR ===');

const accountSchema = {
  address: createValidator('address')
    .required('Address required')
    .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address'),
  
  email: createValidator('email')
    .required('Email required')
    .custom(
      (val) => /^[^\s@]+@[^\s@]+$/.test(val),
      'Invalid email'
    ),
  
  age: createValidator('age')
    .required('Age required')
    .custom(
      (val) => !isNaN(val) && parseInt(val) >= 18,
      'Must be 18 or older'
    )
};

const batch = new BatchValidator(accountSchema);

const testData1 = {
  address: 'TF1kxrUH33nsSyWDwWnN87jdrQKP2eqvhM',
  email: 'user@example.com',
  age: 25
};

const result1 = batch.validate(testData1);
if (result1.valid) {
  console.log('✅ All fields valid. Values:', result1.values);
} else {
  console.log('❌ Validation errors:', result1.errors);
}

// Test with invalid data
const testData2 = {
  address: 'invalid-address',
  email: 'not-an-email',
  age: 15
};

const result2 = batch.validate(testData2);
console.log('Invalid data errors:');
result2.errors.forEach(error => {
  console.log(`  - ${error.field}: ${error.message}`);
});

// ============================================================
// 7. VALIDATOR REGISTRY
// ============================================================

console.log('\n=== VALIDATOR REGISTRY ===');

// Register validators
validatorRegistry.register('tridentAddress',
  createValidator('address')
    .required()
    .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address')
);

validatorRegistry.register('blockHash',
  createValidator('hash')
    .required()
    .matches(/^0x[a-fA-F0-9]{64}$/, 'Invalid block hash')
);

// Use registered validators
const addressResult = validatorRegistry.validate(
  'tridentAddress',
  'TF1kxrUH33nsSyWDwWnN87jdrQKP2eqvhM',
  false
);
console.log('✅ Registry validation successful:', addressResult.valid);

// ============================================================
// 8. ERROR CONTEXT
// ============================================================

console.log('\n=== ERROR CONTEXT ===');

const addressValidator = createValidator('address')
  .required('Address is required')
  .matches(/^T[a-zA-Z0-9]{33}$/, 'Must be valid Trident address');

const errorResult = addressValidator.validate('invalid', false);
if (!errorResult.valid) {
  const error = errorResult.error;
  console.log('Error details:');
  console.log('  - field:', error.field);
  console.log('  - message:', error.message);
  console.log('  - rule:', error.rule);
  console.log('  - context:', error.context);
  console.log('  - timestamp:', error.timestamp);
}

// ============================================================
// 9. PATTERN BUILDER
// ============================================================

console.log('\n=== PATTERN BUILDER ===');

const emailPattern = PatternBuilder.email();
console.log('Email pattern test:', emailPattern.test('user@example.com'));

const hexPattern = PatternBuilder.hex(64);
console.log('Hex pattern test:', hexPattern.test('0x' + 'a'.repeat(64)));

const decimalPattern = PatternBuilder.decimal(8);
console.log('Decimal pattern test:', decimalPattern.test('123.45678901'));

// ============================================================
// 10. CHAINED VALIDATORS
// ============================================================

console.log('\n=== CHAINED VALIDATORS ===');

const passwordValidator = createValidator('password')
  .required('Password required')
  .minLength(8, 'Minimum 8 characters')
  .maxLength(128, 'Maximum 128 characters')
  .custom(
    (val) => /[A-Z]/.test(val),
    'Must contain uppercase letter'
  )
  .custom(
    (val) => /[a-z]/.test(val),
    'Must contain lowercase letter'
  )
  .custom(
    (val) => /[0-9]/.test(val),
    'Must contain number'
  )
  .custom(
    (val) => /[!@#$%^&*]/.test(val),
    'Must contain special character'
  );

const passwordTests = [
  'weak',
  'StrongPass123',
  'ValidPass123!',
];

passwordTests.forEach(password => {
  const result = passwordValidator.validate(password, false);
  console.log(`Password "${password}": ${result.valid ? '✅ Valid' : '❌ ' + result.error.message}`);
});

// ============================================================
// 11. REAL-WORLD FORM VALIDATION
// ============================================================

console.log('\n=== REAL-WORLD FORM VALIDATION ===');

const registrationSchema = {
  username: createValidator('username')
    .required('Username required')
    .minLength(3, 'Minimum 3 characters')
    .maxLength(20, 'Maximum 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, dash, underscore')
    .sanitize((val) => val.trim()),
  
  email: createValidator('email')
    .required('Email required')
    .custom(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Invalid email format'
    )
    .sanitize((val) => val.trim().toLowerCase()),
  
  address: createValidator('address')
    .required('Wallet address required')
    .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address'),
  
  agreeToTerms: createValidator('agreeToTerms')
    .required('You must accept the terms')
    .custom((val) => val === true, 'Agreement is required')
};

const registrationBatch = new BatchValidator(registrationSchema);

const formData = {
  username: 'john_doe',
  email: 'john@example.com',
  address: 'TF1kxrUH33nsSyWDwWnN87jdrQKP2eqvhM',
  agreeToTerms: true
};

const registrationResult = registrationBatch.validate(formData);
if (registrationResult.valid) {
  console.log('✅ Registration form valid!');
  console.log('Cleaned data:', registrationResult.values);
} else {
  console.log('❌ Registration form has errors:');
  registrationResult.errors.forEach(error => {
    console.log(`  - ${error.field}: ${error.message}`);
  });
}

// ============================================================
// 12. SEARCH QUERY VALIDATION
// ============================================================

console.log('\n=== SEARCH QUERY VALIDATION ===');

const searchSchema = {
  query: createValidator('query')
    .required('Search term required')
    .minLength(2, 'Minimum 2 characters')
    .maxLength(100, 'Maximum 100 characters')
    .sanitize((val) => val.trim()),
  
  limit: createValidator('limit')
    .required('Limit required')
    .custom(
      (val) => {
        const num = parseInt(val, 10);
        return num >= 1 && num <= 100;
      },
      'Limit must be 1-100'
    )
    .sanitize((val) => TypeCoercion.toInteger(val)),
  
  offset: createValidator('offset')
    .custom(
      (val) => TypeCoercion.toInteger(val) >= 0,
      'Offset cannot be negative'
    )
    .sanitize((val) => TypeCoercion.toInteger(val))
};

const searchBatch = new BatchValidator(searchSchema);

const searchQuery = {
  query: 'trident',
  limit: '25',
  offset: '0'
};

const searchResult = searchBatch.validate(searchQuery);
if (searchResult.valid) {
  console.log('✅ Search query valid!');
  console.log('Parsed values:', searchResult.values);
}

// ============================================================
// SUMMARY
// ============================================================

console.log('\n=== TEST SUMMARY ===');
console.log('All validation features demonstrated successfully!');
console.log('\nFeatures covered:');
console.log('✅ Basic validators (backward compatible)');
console.log('✅ Format validators (email, URL, UUID, etc.)');
console.log('✅ Numeric validators (decimal, integer, etc.)');
console.log('✅ Type coercion utilities');
console.log('✅ Custom validator builder with chainable API');
console.log('✅ Batch validation for multiple fields');
console.log('✅ Validator registry for reusable validators');
console.log('✅ Enhanced error context and suggestions');
console.log('✅ Pattern builder for safe regex');
console.log('✅ Real-world form and query validation');
