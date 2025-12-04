import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseSearch } from '../utils';
import PropTypes from 'prop-types';
import ThemeToggle from './ThemeToggle';
import { useLocalStorage, useClickOutside, useKeyboardShortcuts } from '../hooks/useCommon';

const APP_TITLE = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';
const MAX_HISTORY_ITEMS = 10;

function NavBar({ wallet, logout, language, setLanguage, theme, toggleTheme, onSettingsClick, onAdvancedSearchClick }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', []);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const historyRef = useClickOutside(() => setShowHistory(false));

  const addToHistory = (query, type) => {
    const historyItem = {
      query,
      type,
      timestamp: Date.now()
    };
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query !== query);
      return [historyItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    });
  };

  const handleSearch = (e, historyQuery = null) => {
    if (e) e.preventDefault();
    const input = (historyQuery || search).trim();
    if (!input) return;
    
    const { type, value } = parseSearch(input);
    
    if (type === 'block') navigate(`/block/${value}`);
    else if (type === 'account') navigate(`/account/${value}`);
    else if (type === 'tx') navigate(`/tx/${value}`);
    else navigate('/404');
    
    if (type !== 'unknown') {
      addToHistory(input, type);
    }
    
    setSearch('');
    setShowHistory(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setShowHistory(false);
  };

  const handleInputFocus = () => {
    if (searchHistory.length > 0) {
      setShowHistory(true);
    }
  };

  const handleHistoryClick = (query) => {
    setSearch(query);
    handleSearch(null, query);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+k': (e) => {
      e.preventDefault();
      searchInputRef.current?.focus();
    },
    'ctrl+/': (e) => {
      e.preventDefault();
      toggleTheme();
    },
    'ctrl+,': (e) => {
      e.preventDefault();
      onSettingsClick?.();
    },
    'escape': () => {
      setShowHistory(false);
      searchInputRef.current?.blur();
    }
  });

  return (
    <nav className="navbar">
      <img src="/trident-logo.svg" alt={APP_TITLE} />
      <span className="brand">{APP_TITLE}</span>
      <Link to="/">{t('Latest Block')}</Link>
      <Link to="/account">{t('Account Lookup')}</Link>
      <Link to="/validators">{t('Validator List')}</Link>
      <Link to="/wallet">{t('Wallet')}</Link>
      <Link to="/admin">{t('Admin Dashboard')}</Link>
      
      <div className="search-container ml-auto" ref={historyRef}>
        <form onSubmit={handleSearch}>
          <input
            ref={searchInputRef}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={handleInputFocus}
            placeholder={t('Search Placeholder')}
            className="search-input"
            title="Press Ctrl+K to focus"
          />
        </form>
        
        {showHistory && searchHistory.length > 0 && (
          <div className="search-history">
            <div className="search-history-header">
              <span>{t('Recent Searches')}</span>
              <button onClick={clearHistory} className="clear-history">
                {t('Clear')}
              </button>
            </div>
            <ul>
              {searchHistory.map((item, index) => (
                <li 
                  key={index} 
                  onClick={() => handleHistoryClick(item.query)}
                  className="search-history-item"
                >
                  <span className={`history-type history-type-${item.type}`}>
                    {item.type}
                  </span>
                  <span className="history-query">{item.query}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <button onClick={handleSearch} className="ml-sm" disabled={!search.trim()}>
        {t('Search')}
      </button>
      <select value={language} onChange={e => setLanguage(e.target.value)} className="ml-sm">
        <option value="en">EN</option>
        <option value="pt">PT</option>
        <option value="es">ES</option>
      </select>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      <button 
        onClick={onSettingsClick} 
        className="settings-btn ml-sm"
        title={t('Settings') + ' (Ctrl+,)'}
        aria-label={t('Settings')}
      >
        ⚙️
      </button>
      {wallet && (
        <span className="ml-sm">
          {wallet.address}{' '}
          <button onClick={logout}>{t('Logout')}</button>
        </span>
      )}
      
      <div className="keyboard-shortcuts-hint">
        <kbd>Ctrl+K</kbd> Search | <kbd>Ctrl+/</kbd> Theme | <kbd>Ctrl+,</kbd> Settings
      </div>
    </nav>
  );
}

NavBar.propTypes = {
  wallet: PropTypes.shape({
    address: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired
  }),
  logout: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  onSettingsClick: PropTypes.func,
  onAdvancedSearchClick: PropTypes.func
};

export default NavBar;
