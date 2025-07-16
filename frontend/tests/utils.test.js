const { deriveAddress, parseSearch } = require('../src/utils');

test('deriveAddress deterministic', () => {
  const pk = 'abc123';
  expect(deriveAddress(pk)).toBe(deriveAddress(pk));
});

test('parseSearch detects block number', () => {
  expect(parseSearch('10')).toEqual({ type: 'block', value: '10' });
});

test('parseSearch detects address', () => {
  const addr = 'T' + 'A'.repeat(33);
  expect(parseSearch(addr).type).toBe('account');
});


