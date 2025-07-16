const { deriveAddress } = require('../src/utils');

test('deriveAddress is deterministic', () => {
  const pk = 'testkey';
  expect(deriveAddress(pk)).toBe(deriveAddress(pk));
});
