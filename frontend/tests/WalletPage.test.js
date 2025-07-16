/** @jest-environment jsdom */
const React = require('react');
const renderer = require('react-test-renderer');
const WalletPage = require('../src/components/WalletPage').default;

test('WalletPage renders login form when logged out', () => {
  const tree = renderer
    .create(
      React.createElement(WalletPage, {
        wallet: null,
        login: () => {},
        logout: () => {},
      })
    )
    .toJSON();
  expect(tree).toBeTruthy();
});

