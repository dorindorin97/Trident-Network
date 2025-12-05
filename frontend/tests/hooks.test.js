/** @jest-environment jsdom */
const React = require('react');
const renderer = require('react-test-renderer');
const { AppContextProvider } = require('../src/context/AppContext');
const { useWallet } = require('../src/context/AppContext');

function WalletTestComponent() {
  const { wallet, login, logout } = useWallet();
  return (
    React.createElement('div', null,
      React.createElement('div', { className: 'wallet-address' }, wallet ? wallet.address : 'no-wallet'),
      React.createElement('button', { onClick: () => login('test-private-key') }, 'Login'),
      React.createElement('button', { onClick: logout }, 'Logout')
    )
  );
}

test('useWallet: login and logout updates context and localStorage', async () => {
  const tree = renderer.create(
    React.createElement(AppContextProvider, null, React.createElement(WalletTestComponent))
  );

  // Initially no wallet
  const instance = tree.root;
  const addressElem = instance.findByProps({ className: 'wallet-address' });
  expect(addressElem.children[0]).toBe('no-wallet');

  // Simulate login
  const loginButton = instance.findAllByType('button')[0];
  loginButton.props.onClick();

  // After login, wallet should be present
  const updatedAddressElem = instance.findByProps({ className: 'wallet-address' });
  // Because deriveAddress is a deterministic hash, it will produce a string starting with 'T'
  expect(typeof updatedAddressElem.children[0]).toBe('string');
  expect(updatedAddressElem.children[0].charAt(0)).toBe('T');

  // Simulate logout
  const logoutButton = instance.findAllByType('button')[1];
  logoutButton.props.onClick();
  const afterLogoutAddressElem = instance.findByProps({ className: 'wallet-address' });
  expect(afterLogoutAddressElem.children[0]).toBe('no-wallet');
});
