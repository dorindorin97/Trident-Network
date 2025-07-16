const { parseSearch } = require('../src/utils');

test('parse block number', () => {
  expect(parseSearch('123').type).toBe('block');
});

test('parse address', () => {
  const addr = 'T' + 'A'.repeat(33);
  expect(parseSearch(addr).type).toBe('account');
});

test('parse tx hash', () => {
  expect(parseSearch('0x' + 'a'.repeat(64)).type).toBe('tx');
});
