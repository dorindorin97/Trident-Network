# Validation Quick Reference

## One-Minute Examples

### Custom Validator
```javascript
const { createValidator } = require('./utils/validation-rules');

const v = createValidator('field')
  .required()
  .minLength(5)
  .maxLength(20);

v.validate('valid-input');  // Works!
```

### Batch Validation
```javascript
const { BatchValidator, createValidator } = require('./utils/validation-rules');

const schema = {
  email: createValidator('email').required(),
  age: createValidator('age').min(18)
};

const batch = new BatchValidator(schema);
const result = batch.validate({ email: 'user@test.com', age: 25 });

if (result.valid) {
  // Use result.values
} else {
  // Check result.errors
}
```

### Format Validators
```javascript
const { FormatValidators, NumericValidators } = require('./utils/validation-rules');

FormatValidators.email('user@test.com');      // ✅
NumericValidators.decimal('123.45', 2);       // ✅
FormatValidators.uuid('550e8400...');         // ✅
```

### Type Coercion
```javascript
const { TypeCoercion } = require('./utils/validation-rules');

TypeCoercion.toNumber('123')         // 123
TypeCoercion.toBoolean('true')       // true
TypeCoercion.toArray('a,b,c')        // ['a', 'b', 'c']
```

## CheatSheet

### ValidatorBuilder Methods

| Method | Usage | Example |
|--------|-------|---------|
| `.required()` | Field is mandatory | `.required('Field required')` |
| `.matches()` | Regex pattern | `.matches(/^[a-z]+$/)` |
| `.minLength()` | Min characters | `.minLength(5, 'Too short')` |
| `.maxLength()` | Max characters | `.maxLength(20, 'Too long')` |
| `.min()` | Min value | `.min(0, 'Must be positive')` |
| `.max()` | Max value | `.max(100, 'Must be ≤100')` |
| `.enum()` | One of values | `.enum(['active', 'inactive'])` |
| `.custom()` | Custom logic | `.custom(val => val.includes('@'))` |
| `.sanitize()` | Transform value | `.sanitize(val => val.trim())` |
| `.validate()` | Execute | `.validate(input, throwOnError?)` |

### Format Validators

```javascript
FormatValidators.email(value)       // Email format
FormatValidators.url(value)         // HTTP/HTTPS URL
FormatValidators.uuid(value)        // UUID format
FormatValidators.base64(value)      // Base64 encoded
FormatValidators.slug(value)        // URL-safe slug
FormatValidators.hex(value, len?)   // Hex string
```

### Numeric Validators

```javascript
NumericValidators.decimal(val, places?)    // Float validation
NumericValidators.integer(val)             // Integer only
NumericValidators.hex(val)                 // Hex to decimal
NumericValidators.scientific(val)          // Scientific notation
NumericValidators.positive(val, allowZero) // Positive numbers
```

### Type Coercion

```javascript
TypeCoercion.toBoolean(val)    // String/any to boolean
TypeCoercion.toNumber(val)     // String/any to number
TypeCoercion.toInteger(val)    // String/any to integer
TypeCoercion.toString(val)     // Any to string
TypeCoercion.toArray(val)      // String to array
TypeCoercion.toDate(val)       // String to Date
```

## Common Patterns

### Email Field
```javascript
createValidator('email')
  .required('Email required')
  .custom(
    (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
    'Invalid email'
  )
```

### URL Field
```javascript
createValidator('url')
  .required('URL required')
  .custom(
    (val) => { try { new URL(val); return true; } catch { return false; } },
    'Invalid URL'
  )
```

### Password Field
```javascript
createValidator('password')
  .required('Password required')
  .minLength(8, 'Min 8 characters')
  .custom(
    (val) => /[A-Z]/.test(val),
    'Need uppercase letter'
  )
  .custom(
    (val) => /[0-9]/.test(val),
    'Need number'
  )
```

### Phone Number
```javascript
createValidator('phone')
  .required('Phone required')
  .matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone')
```

### Username
```javascript
createValidator('username')
  .required('Username required')
  .minLength(3, 'Min 3 characters')
  .maxLength(20, 'Max 20 characters')
  .matches(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, dash, underscore')
```

### Blockchain Address
```javascript
createValidator('address')
  .required('Address required')
  .matches(/^T[a-zA-Z0-9]{33}$/, 'Invalid Trident address')
```

### Transaction Amount
```javascript
createValidator('amount')
  .required('Amount required')
  .custom(
    (val) => /^\d+(\.\d{1,8})?$/.test(val),
    'Invalid amount format'
  )
  .custom(
    (val) => parseFloat(val) > 0,
    'Must be positive'
  )
  .custom(
    (val) => parseFloat(val) <= 999999999999,
    'Amount too large'
  )
```

## Error Handling

### Throw on Error (immediate stop)
```javascript
try {
  const result = validator.validate(input, true);  // Default
  console.log(result);
} catch (error) {
  console.error(error.message);      // Error message
  console.error(error.field);        // Field name
  console.error(error.rule);         // Validation rule
  console.error(error.context);      // Additional context
}
```

### Non-throwing (collect errors)
```javascript
const result = validator.validate(input, false);

if (!result.valid) {
  console.error(result.error.message);
  console.error(result.error.context);
} else {
  console.log(result.value);  // Sanitized/validated value
}
```

### Batch Error Collection
```javascript
const result = batch.validate(data);

if (!result.valid) {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

## Registry Usage

### Register Once
```javascript
const { validatorRegistry, createValidator } = require('./utils/validation-rules');

validatorRegistry.register('email',
  createValidator('email').required()...
);
```

### Use Many Times
```javascript
validatorRegistry.validate('email', userEmail, false);
```

### Check Existence
```javascript
if (validatorRegistry.has('email')) {
  // Use registered validator
}
```

## Performance Tips

1. **Register validators** for repeated validations
2. **Use batch validation** for forms
3. **Sanitize before validate** (trim, lowercase, etc.)
4. **Reuse validators** via registry
5. **Avoid regex in loops** - use PatternBuilder instead

## Integration Examples

### Express Middleware
```javascript
const validate = (schema) => (req, res, next) => {
  const batch = new BatchValidator(schema);
  const result = batch.validate(req.body);
  
  if (!result.valid) {
    return res.status(400).json({ errors: result.errors });
  }
  
  req.validated = result.values;
  next();
};

app.post('/register', 
  validate(registrationSchema),
  handleRegistration
);
```

### React Component
```javascript
const [errors, setErrors] = useState({});

const handleSubmit = (formData) => {
  const result = batch.validate(formData);
  
  if (!result.valid) {
    const errorMap = {};
    result.errors.forEach(e => {
      errorMap[e.field] = e.message;
    });
    setErrors(errorMap);
    return;
  }
  
  submitForm(result.values);
};
```

## Backward Compatibility

All existing code works unchanged:
```javascript
const { validateAddress, ValidationError } = require('./utils/validation-rules');

// These still work exactly as before
const address = validateAddress(input);
```

---

**See ADVANCED_VALIDATION_GUIDE.md for complete documentation**
