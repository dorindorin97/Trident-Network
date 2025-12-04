// Setup for Jest tests
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
