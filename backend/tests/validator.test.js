const validator = require('../utils/validator');

describe('Validator Utilities', () => {
  describe('isValidAddress', () => {
    test('should accept valid addresses', () => {
      expect(validator.isValidAddress('T' + 'a'.repeat(39))).toBe(true);
      expect(validator.isValidAddress('T' + '1'.repeat(39))).toBe(true);
      expect(validator.isValidAddress('TACC1PLACEHOLDER000000000000000000000000')).toBe(true);
    });

    test('should reject invalid addresses', () => {
      expect(validator.isValidAddress('T123')).toBe(false);
      expect(validator.isValidAddress('AACC1PLACEHOLDER000000000000000000000000')).toBe(false);
      expect(validator.isValidAddress('T' + 'a'.repeat(38))).toBe(false);
      expect(validator.isValidAddress('T' + 'a'.repeat(40))).toBe(false);
      expect(validator.isValidAddress(null)).toBe(false);
      expect(validator.isValidAddress(123)).toBe(false);
    });
  });

  describe('isValidBlockNumber', () => {
    test('should accept valid block numbers', () => {
      expect(validator.isValidBlockNumber('0')).toBe(true);
      expect(validator.isValidBlockNumber('12345')).toBe(true);
      expect(validator.isValidBlockNumber('999999999')).toBe(true);
    });

    test('should reject invalid block numbers', () => {
      expect(validator.isValidBlockNumber('-1')).toBe(false);
      expect(validator.isValidBlockNumber('abc')).toBe(false);
      expect(validator.isValidBlockNumber('12.34')).toBe(false);
      expect(validator.isValidBlockNumber('')).toBe(false);
    });
  });

  describe('isValidBlockHash', () => {
    test('should accept valid block hashes (64 hex chars)', () => {
      const validHash1 = '0x' + '1234567890abcdef'.repeat(4);
      const validHash2 = '0x' + 'ABCDEF1234567890'.repeat(4);
      expect(validator.isValidBlockHash(validHash1)).toBe(true);
      expect(validator.isValidBlockHash(validHash2)).toBe(true);
    });

    test('should reject invalid block hashes', () => {
      expect(validator.isValidBlockHash('0x123')).toBe(false);
      expect(validator.isValidBlockHash('0x1234567890abcdef')).toBe(false); // Only 16 chars
      expect(validator.isValidBlockHash('1234567890abcdef')).toBe(false); // Missing 0x
      expect(validator.isValidBlockHash('0x' + 'GHIJKL' + 'a'.repeat(58))).toBe(false); // Invalid chars
      expect(validator.isValidBlockHash(null)).toBe(false);
    });
  });

  describe('isValidTxId', () => {
    test('should accept valid transaction IDs', () => {
      const validTxId = 'abcdef1234567890'.repeat(4);
      expect(validator.isValidTxId(validTxId)).toBe(true);
      expect(validator.isValidTxId('0x' + validTxId)).toBe(true);
    });

    test('should reject invalid transaction IDs', () => {
      expect(validator.isValidTxId('0x123')).toBe(false);
      expect(validator.isValidTxId('GHIJKL' + 'a'.repeat(58))).toBe(false);
      expect(validator.isValidTxId(null)).toBe(false);
    });
  });

  describe('validatePagination', () => {
    test('should return valid pagination with defaults', () => {
      const result = validator.validatePagination();
      expect(result.valid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    test('should accept valid pagination parameters', () => {
      const result = validator.validatePagination(2, 20);
      expect(result.valid).toBe(true);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
    });

    test('should enforce max limit', () => {
      const result = validator.validatePagination(1, 200);
      expect(result.valid).toBe(true);
      expect(result.limit).toBe(100);
    });

    test('should enforce min values', () => {
      const result = validator.validatePagination(0, -5);
      expect(result.valid).toBe(true);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });

    test('should reject invalid parameters', () => {
      const result = validator.validatePagination('abc', 'def');
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('sanitizeString', () => {
    test('should return empty string for non-strings', () => {
      expect(validator.sanitizeString(null)).toBe('');
      expect(validator.sanitizeString(123)).toBe('');
      expect(validator.sanitizeString(undefined)).toBe('');
    });

    test('should trim strings', () => {
      expect(validator.sanitizeString('  hello  ')).toBe('hello');
    });

    test('should enforce max length', () => {
      const longString = 'a'.repeat(2000);
      expect(validator.sanitizeString(longString).length).toBe(1000);
      expect(validator.sanitizeString(longString, 50).length).toBe(50);
    });
  });
});
