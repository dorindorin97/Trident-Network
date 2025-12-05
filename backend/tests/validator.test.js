const { validateAddress, validatePagination, RULES, createValidator } = require('../utils/validation-rules');

describe('Validation Rules', () => {
  describe('validateAddress', () => {
    test('should accept valid addresses', () => {
      expect(validateAddress('T' + 'a'.repeat(33))).toBe('T' + 'a'.repeat(33));
      expect(validateAddress('T' + '1'.repeat(33))).toBe('T' + '1'.repeat(33));
    });

    test('should reject invalid addresses', () => {
      expect(() => validateAddress('T123')).toThrow();
      expect(() => validateAddress('AACC1PLACEHOLDER000000000000000000')).toThrow();
      expect(() => validateAddress('T' + 'a'.repeat(32))).toThrow();
      expect(() => validateAddress('T' + 'a'.repeat(34))).toThrow();
      expect(() => validateAddress(null)).toThrow();
    });
  });

  describe('validatePagination', () => {
    test('should return valid pagination with defaults', () => {
      const result = validatePagination();
      expect(result.valid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    test('should accept valid pagination parameters', () => {
      const result = validatePagination(2, 20);
      expect(result.valid).toBe(true);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    test('should enforce max limit', () => {
      const result = validatePagination(1, 200);
      expect(result.valid).toBe(true);
      expect(result.limit).toBe(RULES.pagination.maxLimit);
    });

    test('should enforce min values', () => {
      const result = validatePagination(0, -5);
      expect(result.valid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(RULES.pagination.minLimit);
    });

    test('should reject invalid parameters', () => {
      const result = validatePagination('abc', 'def');
      expect(result.valid).toBe(false);
    });
  });

  describe('createValidator - custom validators', () => {
    test('should validate required fields', () => {
      const validator = createValidator('name')
        .required('Name is required');

      const result = validator.validate('John');
      expect(result.valid).toBe(true);
      expect(result.value).toBe('John');
    });

    test('should reject empty required fields', () => {
      const validator = createValidator('name')
        .required('Name is required');

      const result = validator.validate('', false);
      expect(result.valid).toBe(false);
    });

    test('should validate string length', () => {
      const validator = createValidator('username')
        .minLength(3, 'Username must be at least 3 characters')
        .maxLength(20, 'Username cannot exceed 20 characters');

      expect(validator.validate('ab', false).valid).toBe(false);
      expect(validator.validate('abc', false).valid).toBe(true);
      expect(validator.validate('a'.repeat(21), false).valid).toBe(false);
    });
  });
});
