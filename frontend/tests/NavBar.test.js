/** @jest-environment jsdom */
const React = require('react');
const renderer = require('react-test-renderer');
const { MemoryRouter } = require('react-router-dom');
const NavBar = require('../src/components/NavBar').default;

test('NavBar renders without crashing', () => {
  const tree = renderer
    .create(
      React.createElement(
        MemoryRouter,
        null,
        React.createElement(NavBar, {
          wallet: null,
          logout: () => {},
          language: 'en',
          setLanguage: () => {},
          theme: 'dark',
          toggleTheme: () => {},
        })
      )
    )
    .toJSON();
  expect(tree).toBeTruthy();
});

