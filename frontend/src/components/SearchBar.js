import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useDebounce } from '../hooks/useCommon';
import { parseSearch } from '../utils';
import './SearchBar.css';

function SearchBar({ placeholder, autoFocus = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const debouncedQuery = useDebounce(query, 300);

  const handleSearch = (value) => {
    const trimmedValue = (value || query).trim();
    if (!trimmedValue) return;

    const parsed = parseSearch(trimmedValue);
    
    switch (parsed.type) {
      case 'block':
        navigate(`/block/${parsed.value}`);
        break;
      case 'account':
        navigate(`/account/${parsed.value}`);
        break;
      case 'tx':
        navigate(`/tx/${parsed.value}`);
        break;
      default:
        // If unknown, try as block number first
        navigate(`/block/${trimmedValue}`);
    }
    
    setQuery('');
    setSuggestions(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setQuery('');
      setSuggestions(null);
    }
  };

  // Show search type suggestions as user types
  React.useEffect(() => {
    if (debouncedQuery.trim()) {
      const parsed = parseSearch(debouncedQuery);
      if (parsed.type !== 'unknown') {
        setSuggestions({
          type: parsed.type,
          value: parsed.value
        });
      } else {
        setSuggestions(null);
      }
    } else {
      setSuggestions(null);
    }
  }, [debouncedQuery]);

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder || t('Search Placeholder')}
          className="search-input"
          autoFocus={autoFocus}
          aria-label={t('Search')}
        />
        <button 
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          className="search-button"
          aria-label={t('Search')}
        >
          🔍
        </button>
      </div>
      {suggestions && (
        <div className="search-suggestions">
          <small>
            {t(`Searching for ${suggestions.type}`)}: {suggestions.value.slice(0, 20)}
            {suggestions.value.length > 20 && '...'}
          </small>
        </div>
      )}
    </div>
  );
}

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool
};

export default React.memo(SearchBar);
