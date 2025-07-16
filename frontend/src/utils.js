const { sha256 } = require('js-sha256');

function deriveAddress(privateKey) {
  const hash = sha256(privateKey);
  return 'T' + hash.slice(0, 39);
}

function parseSearch(input) {
  if (/^\d+$/.test(input)) return { type: 'block', value: input };
  if (/^T\w{33}$/.test(input)) return { type: 'account', value: input };
  if (/^0x[0-9a-fA-F]{16}$/.test(input)) return { type: 'block', value: input };
  if (/^(0x)?[0-9a-fA-F]{64}$/.test(input)) {
    const id = input.startsWith('0x') ? input : `0x${input}`;
    return { type: 'tx', value: id };
  }
  return { type: 'unknown', value: input };
}

module.exports = { deriveAddress, parseSearch };
