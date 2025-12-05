/* eslint-env jest */
/**
 * Tests for error-classifier utility
 */

const { classifyError, getErrorCodeObject, createErrorHandlingWrapper } = require('../error-classifier');
const { ERROR_CODES } = require('../error-codes');

describe('Error Classifier', () => {
  describe('classifyError', () => {
    test('should detect 404 errors', () => {
      const error = new Error('404 not found');
      const result = classifyError(error, 'BLOCK_NOT_FOUND');
      expect(result.status).toBe(404);
      expect(result.code).toBe('BLOCK_NOT_FOUND');
    });

    test('should detect timeout errors', () => {
      const error = new Error('Request timeout');
      const result = classifyError(error);
      expect(result.status).toBe(504);
      expect(result.code).toBe('GATEWAY_TIMEOUT');
      expect(result.shouldRetry).toBe(true);
    });

    test('should detect 500 errors', () => {
      const error = new Error('Internal server error');
      const result = classifyError(error);
      expect(result.status).toBe(502);
      expect(result.code).toBe('BAD_GATEWAY');
    });

    test('should default to 503 for unknown errors', () => {
      const error = new Error('Unknown error');
      const result = classifyError(error);
      expect(result.status).toBe(503);
      expect(result.shouldRetry).toBe(false);
    });

    test('should be case-insensitive', () => {
      const error = new Error('NOT FOUND');
      const result = classifyError(error);
      expect(result.status).toBe(404);
    });
  });

  describe('getErrorCodeObject', () => {
    test('should return valid error code', () => {
      const result = getErrorCodeObject('INVALID_ADDRESS');
      expect(result).toBeDefined();
      expect(result.status).toBe(ERROR_CODES.INVALID_ADDRESS.status);
    });

    test('should return SERVICE_UNAVAILABLE for unknown codes', () => {
      const result = getErrorCodeObject('UNKNOWN_CODE');
      expect(result).toEqual(ERROR_CODES.SERVICE_UNAVAILABLE);
    });
  });

  describe('createErrorHandlingWrapper', () => {
    test('should catch errors and return proper response', async () => {
      const mockHandler = jest.fn().mockRejectedValue(new Error('404 not found'));
      const mockReq = { id: 'test-id' };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis()
      };
      const mockNext = jest.fn();

      const wrapped = createErrorHandlingWrapper(mockHandler, {
        endpoint: '/test',
        defaultNotFoundCode: 'TEST_NOT_FOUND'
      });

      await wrapped(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalled();
    });

    test('should call handler on success', async () => {
      const mockHandler = jest.fn().mockResolvedValue({ data: 'test' });
      const mockReq = { id: 'test-id' };
      const mockRes = jest.fn();
      const mockNext = jest.fn();

      const wrapped = createErrorHandlingWrapper(mockHandler);

      await wrapped(mockReq, mockRes, mockNext);

      expect(mockHandler).toHaveBeenCalled();
    });
  });
});
