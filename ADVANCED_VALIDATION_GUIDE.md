# Advanced Validation System Guide

## Overview

The enhanced validation system in `backend/utils/validation-rules.js` provides production-ready validators with chainable APIs, batch validation, type coercion, and comprehensive error reporting.

**New Capabilities:**
- ✅ Custom validator builder with chainable API
- ✅ Batch validation for multiple fields
- ✅ Format validators (email, URL, UUID, base64, slug, hex)
- ✅ Numeric validators (decimal, integer, scientific notation)
- ✅ Type coercion utilities
- ✅ Validator registry for reuse
- ✅ Enhanced error context with suggestions

## Core Components

### 1. PatternBuilder - DRY Regex Patterns

Create consistent regex patterns safely:

```javascript
const { PatternBuilder } = require('./utils/validation-rules');

// Pre-built patterns
PatternBuilder.hex(64)          // 0x-prefixed 64-char hex
PatternBuilder.decimal(8)       // Max 8 decimal places
PatternBuilder.slug()           // Lowercase letters, numbers, hyphens
PatternBuilder.uuid()           // Standard UUID format
PatternBuilder.email()          // Basic email validation
PatternBuilder.url()            // http/https URLs
PatternBuilder.base64()         // Base64 encoded strings
```

### 2. ValidatorBuilder - Chainable API

Build reusable validators with a fluent interface:

```javascript
const { createValidator } = require('./utils/validation-rules');

// Create a custom validator
const addressValidator = createValidator('account')
  .required('Account address is required')
  .minLength(34, 'Address too short')
  .maxLength(34, 'Address too long')
  .matches(/^T[a-zA-Z0-9]{33}$/, 'Must start with T')
  .sanitize(val => val.trim());

// Use it
try {
  const cleaned = addressValidator.validate('  TF_example_account  ', true);
  console.log(cleaned); // 'TF_example_account'
} catch (error) {
  console.error(error.message);
}

// Get error details without throwing
const result = addressValidator.validate('invalid', false);
if (!result.valid) {
  console.log(result.error.message);
  console.log(result.error.context);
}
```

**Available Methods:**
```javascript
// Validators
.required(message?)                  // Must not be null/empty
.custom(testFn, message?)           // Custom validation logic
.matches(pattern, message?)         // Regex pattern matching
.minLength(length, message?)        // Minimum string length
.maxLength(length, message?)        // Maximum string length
.min(value, message?)               // Minimum numeric value
.max(value, message?)               // Maximum numeric value
.enum(values, message?)             // One of allowed values

// Sanitizers (applied before validation)
.sanitize(fn)                       // Transform value
.setErrorMessage(message)           // Override error message

// Execution
.validate(value, throwOnError?)     // Returns {valid, value, error}
```

### 3. FormatValidators - String Formats

Pre-built validators for common formats:

```javascript
const { FormatValidators } = require('./utils/validation-rules');

// Email validation
try {
  const email = FormatValidators.email('user@example.com');
} catch (error) {
  console.error('Invalid email:', error.message);
}

// URL validation
try {
  const url = FormatValidators.url('https://example.com');
} catch (error) {
  console.error('Invalid URL:', error.message);
}

// UUID validation
try {
  const uuid = FormatValidators.uuid('550e8400-e29b-41d4-a716-446655440000');
} catch (error) {
  console.error('Invalid UUID:', error.message);
}

// Base64 validation
try {
  const b64 = FormatValidators.base64('aGVsbG8gd29ybGQ=');
} catch (error) {
  console.error('Invalid base64:', error.message);
}

// Slug validation
try {
  const slug = FormatValidators.slug('my-awesome-page');
} catch (error) {
  console.error('Invalid slug:', error.message);
}

// Hex validation
try {
  const hex = FormatValidators.hex('0x1234567890abcdef', 16);
} catch (error) {
  console.error('Invalid hex:', error.message);
}
```

### 4. NumericValidators - Number Formats

Specialized validators for numeric data:

```javascript
const { NumericValidators } = require('./utils/validation-rules');

// Decimal numbers
const amount = NumericValidators.decimal('123.45', 2);
// ✅ Returns: 123.45
// ❌ Throws: Cannot exceed 2 decimal places

// Integers only
const count = NumericValidators.integer('42');
// ✅ Returns: 42
// ❌ Throws: 42.5 is not a valid integer

// Hexadecimal
const hex = NumericValidators.hex('0xFF');
// ✅ Returns: 255
// ❌ Throws: Invalid hexadecimal

// Scientific notation
const scientific = NumericValidators.scientific('1.23e-4');
// ✅ Returns: 0.000123

// Positive numbers (zero optional)
const positive = NumericValidators.positive('42', false);
// ✅ Returns: 42
// ❌ Throws: Value must be positive
```

### 5. TypeCoercion - Automatic Type Conversion

Safe type conversions with error handling:

```javascript
const { TypeCoercion } = require('./utils/validation-rules');

// String to boolean
TypeCoercion.toBoolean('true')      // true
TypeCoercion.toBoolean('false')     // false
TypeCoercion.toBoolean('1')         // true
TypeCoercion.toBoolean('0')         // false

// String to number
TypeCoercion.toNumber('123')        // 123
TypeCoercion.toNumber('123.45')     // 123.45

// String to integer
TypeCoercion.toInteger('123.45')    // 123

// String to array
TypeCoercion.toArray('a,b,c')       // ['a', 'b', 'c']
TypeCoercion.toArray('single')      // ['single']
TypeCoercion.toArray(['already', 'array']) // ['already', 'array']

// String to date
TypeCoercion.toDate('2024-01-01')   // Date object
TypeCoercion.toDate('invalid')      // Throws ValidationError
```

### 6. BatchValidator - Multiple Fields

Validate multiple fields at once and collect all errors:

```javascript
const { BatchValidator, createValidator } = require('./utils/validation-rules');

// Build a schema
const schema = {
  email: createValidator('email').required().custom(
    (val) => /^[^\s@]+@[^\s@]+$/.test(val),
    'Invalid email format'
  ),
  age: createValidator('age').required().min(18, 'Must be 18+').max(120),
  username: createValidator('username').required().minLength(3).maxLength(20)
};

const batch = new BatchValidator(schema);

// Validate data
const result = batch.validate({
  email: 'user@example.com',
  age: 25,
  username: 'john_doe'
});

if (result.valid) {
  console.log('All fields valid:', result.values);
  // { email: 'user@example.com', age: 25, username: 'john_doe' }
} else {
  console.log('Validation errors:', result.errors);
  // [
  //   { field: 'age', message: 'Must be 18+', rule: 'min', context: {} },
  //   { field: 'username', message: 'Must be at least 3 characters', ... }
  // ]
}
```

## Real-World Examples

### Example 1: Account Creation Form

```javascript
const { createValidator, BatchValidator } = require('./utils/validation-rules');

const accountSchema = {
  address: createValidator('address')
    .required('Wallet address required')
    .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address'),
  
  email: createValidator('email')
    .required('Email required')
    .custom(
      (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Invalid email address'
    ),
  
  nickname: createValidator('nickname')
    .required('Nickname required')
    .minLength(3, 'Nickname too short')
    .maxLength(20, 'Nickname too long')
    .sanitize((val) => val.trim()),
  
  agreeToTerms: createValidator('agreeToTerms')
    .required('Must accept terms and conditions')
    .custom((val) => val === true, 'You must agree to continue')
};

// Validate user input
const batch = new BatchValidator(accountSchema);
const formData = req.body;
const result = batch.validate(formData);

if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}

// Save user with validated data
await User.create(result.values);
```

### Example 2: Search Query Validation

```javascript
const { createValidator, BatchValidator, TypeCoercion } = require('./utils/validation-rules');

const searchSchema = {
  query: createValidator('query')
    .required('Search term required')
    .minLength(2, 'Search term too short')
    .maxLength(100, 'Search term too long')
    .sanitize((val) => val.trim()),
  
  limit: createValidator('limit')
    .custom(
      (val) => TypeCoercion.toInteger(val) >= 1 && TypeCoercion.toInteger(val) <= 100,
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

const batch = new BatchValidator(searchSchema);
const { query, limit, offset } = req.query;
const result = batch.validate({ query, limit, offset });

if (!result.valid) {
  return res.status(400).json({ errors: result.errors });
}

// Query database with validated parameters
const results = await Transaction.search(
  result.values.query,
  result.values.limit,
  result.values.offset
);
```

### Example 3: Custom Domain Validators

```javascript
const { validatorRegistry, createValidator } = require('./utils/validation-rules');

// Register domain-specific validators once
validatorRegistry.register('tridentAddress', 
  createValidator('address')
    .required()
    .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address')
);

registryValidator.register('blockHash',
  createValidator('hash')
    .required()
    .matches(/^0x[a-fA-F0-9]{64}$/, 'Invalid block hash')
);

registryValidator.register('amount',
  createValidator('amount')
    .required()
    .custom((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 999999999999;
    }, 'Invalid amount')
);

// Reuse validators throughout app
const addressResult = validatorRegistry.validate('tridentAddress', userAddress, false);
const hashResult = validatorRegistry.validate('blockHash', blockId, false);
const amountResult = validatorRegistry.validate('amount', transactionAmount, false);
```

## Error Context & Suggestions

Enhanced error messages include context:

```javascript
const result = addressValidator.validate('0xInvalid123', false);

if (!result.valid) {
  const error = result.error;
  console.log(error.message);        // "Address: Must start with T (you provided: 0x...)"
  console.log(error.field);          // "address"
  console.log(error.rule);           // "pattern"
  console.log(error.context);        // { provided: '0x...', length: 11 }
  console.log(error.timestamp);      // "2024-01-15T10:30:00.000Z"
}
```

## Performance Considerations

### 1. Registry Caching

```javascript
// ❌ Creates new validator each time
function validate(data) {
  const validator = createValidator('email').required()...
  return validator.validate(data.email);
}

// ✅ Register once, reuse many times
validatorRegistry.register('email', 
  createValidator('email').required()...
);

function validate(data) {
  return validatorRegistry.validate('email', data.email, false);
}
```

### 2. Batch Validation

```javascript
// ❌ Multiple individual validations (slower)
validateEmail(data.email);
validateUsername(data.username);
validatePassword(data.password);

// ✅ Single batch operation (faster)
const result = batch.validate(data);
```

## Migration Guide

### From Legacy Validators

```javascript
// Old code
const { validateAddress } = require('./utils/validation-rules');
const address = validateAddress(userInput);

// New code (backward compatible)
const { validateAddress } = require('./utils/validation-rules');
const address = validateAddress(userInput);  // Still works!

// New approach (with batching)
const { BatchValidator, createValidator } = require('./utils/validation-rules');
const batch = new BatchValidator({
  address: createValidator('address').required().matches(/^T[a-zA-Z0-9]{33}$/)
});
const result = batch.validate({ address: userInput });
```

## Testing Validators

```javascript
const { createValidator, BatchValidator, FormatValidators } = require('./utils/validation-rules');

describe('Email Validator', () => {
  it('should validate correct email format', () => {
    const result = FormatValidators.email('user@example.com');
    expect(result).toBe('user@example.com');
  });

  it('should throw on invalid email', () => {
    expect(() => FormatValidators.email('invalid')).toThrow();
  });
});

describe('BatchValidator', () => {
  it('should validate multiple fields', () => {
    const schema = {
      email: createValidator('email').required(),
      age: createValidator('age').min(18)
    };
    const batch = new BatchValidator(schema);
    const result = batch.validate({ email: 'user@test.com', age: 25 });
    expect(result.valid).toBe(true);
  });
});
```

## Best Practices

1. **Register validators once** - Use registry for frequently validated fields
2. **Use batch validation** - Collect all errors before responding
3. **Add context to errors** - Help developers understand what went wrong
4. **Chain validators** - Use fluent API for readable validation rules
5. **Sanitize early** - Clean input before validation
6. **Provide defaults** - Use sensible defaults for optional fields
7. **Test edge cases** - Empty strings, null, undefined, very long strings

## Backward Compatibility

All new features are **100% backward compatible**. Existing code continues to work:

```javascript
// Old exports still available
const { validateAddress, ValidationError, RULES } = require('./utils/validation-rules');

// New exports available without breaking anything
const { createValidator, BatchValidator, FormatValidators } = require('./utils/validation-rules');
```

## Summary Table

| Feature | Purpose | Example |
|---------|---------|---------|
| **PatternBuilder** | DRY regex patterns | `PatternBuilder.email()` |
| **ValidatorBuilder** | Chainable validators | `createValidator().required().min(10)` |
| **FormatValidators** | Common formats | `FormatValidators.email(value)` |
| **NumericValidators** | Number formats | `NumericValidators.decimal(value, 2)` |
| **TypeCoercion** | Type conversion | `TypeCoercion.toNumber('123')` |
| **BatchValidator** | Multi-field | `batch.validate({...})` |
| **ValidatorRegistry** | Reusable validators | `registry.register('email', ...)` |
| **ValidationError** | Enhanced errors | `error.context, error.field` |
