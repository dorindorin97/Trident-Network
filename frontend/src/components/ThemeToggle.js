import React from 'react';
import PropTypes from 'prop-types';
import './ThemeToggle.css';

/**
 * Animated theme toggle button
 */
function ThemeToggle({ theme, toggleTheme }) {
  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </button>
  );
}

ThemeToggle.propTypes = {
  theme: PropTypes.oneOf(['dark', 'light']).isRequired,
  toggleTheme: PropTypes.func.isRequired
};

export default ThemeToggle;
