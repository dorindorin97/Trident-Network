import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useClickOutside } from '../hooks/useCommon';
import { PATTERNS } from '../config';
import './AdvancedSearch.css';

/**
 * Advanced search modal with filters
 * Supports searching blocks, transactions, and accounts with various filters
 */
function AdvancedSearch({ isOpen, onClose }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState('all');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    blockRange: { min: '', max: '' },
    dateRange: { from: '', to: '' },
    amountRange: { min: '', max: '' },
    status: 'all'
  });
  const [error, setError] = useState('');

  const modalRef = useClickOutside(onClose);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    if (!query.trim()) {
      setError(t('Please enter a search query'));
      return;
    }

    // Detect search type if "all" is selected
    let type = searchType;
    if (type === 'all') {
      if (PATTERNS.BLOCK_NUMBER.test(query)) {
        type = 'block';
      } else if (PATTERNS.TX_ID.test(query)) {
        type = 'transaction';
      } else if (PATTERNS.ADDRESS.test(query)) {
        type = 'account';
      } else if (PATTERNS.BLOCK_HASH.test(query)) {
        type = 'block';
      } else {
        setError(t('Invalid search query format'));
        return;
      }
    }

    // Navigate based on type
    switch (type) {
      case 'block':
        if (PATTERNS.BLOCK_NUMBER.test(query)) {
          navigate(`/block/${query}`);
        } else if (PATTERNS.BLOCK_HASH.test(query)) {
          navigate(`/block/${query}`);
        } else {
          setError(t('Invalid block number or hash'));
          return;
        }
        break;
      case 'transaction':
        if (PATTERNS.TX_ID.test(query)) {
          navigate(`/tx/${query}`);
        } else {
          setError(t('Invalid transaction ID'));
          return;
        }
        break;
      case 'account':
        if (PATTERNS.ADDRESS.test(query)) {
          navigate(`/account/${query}`);
        } else {
          setError(t('Invalid account address'));
          return;
        }
        break;
      default:
        setError(t('Unknown search type'));
        return;
    }

    onClose();
  };

  const handleReset = () => {
    setQuery('');
    setSearchType('all');
    setFilters({
      blockRange: { min: '', max: '' },
      dateRange: { from: '', to: '' },
      amountRange: { min: '', max: '' },
      status: 'all'
    });
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="advanced-search-overlay">
      <div className="advanced-search-modal" ref={modalRef}>
        <div className="advanced-search-header">
          <h2>{t('Advanced Search')}</h2>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label={t('Close')}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSearch} className="advanced-search-form">
          {/* Search Type Selection */}
          <div className="form-group">
            <label>{t('Search Type')}</label>
            <div className="search-type-buttons">
              <button
                type="button"
                className={searchType === 'all' ? 'active' : ''}
                onClick={() => setSearchType('all')}
              >
                {t('Auto Detect')}
              </button>
              <button
                type="button"
                className={searchType === 'block' ? 'active' : ''}
                onClick={() => setSearchType('block')}
              >
                {t('Block')}
              </button>
              <button
                type="button"
                className={searchType === 'transaction' ? 'active' : ''}
                onClick={() => setSearchType('transaction')}
              >
                {t('Transaction')}
              </button>
              <button
                type="button"
                className={searchType === 'account' ? 'active' : ''}
                onClick={() => setSearchType('account')}
              >
                {t('Account')}
              </button>
            </div>
          </div>

          {/* Search Query Input */}
          <div className="form-group">
            <label htmlFor="search-query">{t('Search Query')}</label>
            <input
              id="search-query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Enter block number, transaction ID, or address')}
              className="search-input"
              autoFocus
            />
            <small className="input-hint">
              {searchType === 'block' && t('Block number or hash (0x...)')}
              {searchType === 'transaction' && t('Transaction hash (0x...)')}
              {searchType === 'account' && t('Account address (T...)')}
              {searchType === 'all' && t('Any valid block, transaction, or address')}
            </small>
          </div>

          {/* Advanced Filters */}
          <div className="advanced-filters">
            <h3>{t('Filters')} <span className="optional">({t('Optional')})</span></h3>

            {/* Block Range Filter */}
            <div className="form-group">
              <label>{t('Block Range')}</label>
              <div className="range-inputs">
                <input
                  type="number"
                  placeholder={t('Min')}
                  value={filters.blockRange.min}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    blockRange: { ...f.blockRange, min: e.target.value }
                  }))}
                  min="0"
                />
                <span className="range-separator">—</span>
                <input
                  type="number"
                  placeholder={t('Max')}
                  value={filters.blockRange.max}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    blockRange: { ...f.blockRange, max: e.target.value }
                  }))}
                  min="0"
                />
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="form-group">
              <label>{t('Date Range')}</label>
              <div className="range-inputs">
                <input
                  type="date"
                  value={filters.dateRange.from}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    dateRange: { ...f.dateRange, from: e.target.value }
                  }))}
                />
                <span className="range-separator">—</span>
                <input
                  type="date"
                  value={filters.dateRange.to}
                  onChange={(e) => setFilters(f => ({
                    ...f,
                    dateRange: { ...f.dateRange, to: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Amount Range Filter (for transactions) */}
            {(searchType === 'transaction' || searchType === 'all') && (
              <div className="form-group">
                <label>{t('Amount Range')}</label>
                <div className="range-inputs">
                  <input
                    type="number"
                    placeholder={t('Min Amount')}
                    value={filters.amountRange.min}
                    onChange={(e) => setFilters(f => ({
                      ...f,
                      amountRange: { ...f.amountRange, min: e.target.value }
                    }))}
                    min="0"
                    step="0.000001"
                  />
                  <span className="range-separator">—</span>
                  <input
                    type="number"
                    placeholder={t('Max Amount')}
                    value={filters.amountRange.max}
                    onChange={(e) => setFilters(f => ({
                      ...f,
                      amountRange: { ...f.amountRange, max: e.target.value }
                    }))}
                    min="0"
                    step="0.000001"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="search-error">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
            <button type="button" onClick={handleReset} className="btn-secondary">
              {t('Reset')}
            </button>
            <button type="submit" className="btn-primary">
              🔍 {t('Search')}
            </button>
          </div>
        </form>

        {/* Search Tips */}
        <div className="search-tips">
          <h4>{t('Search Tips')}</h4>
          <ul>
            <li>{t('Block numbers are positive integers (e.g., 12345)')}</li>
            <li>{t('Block and transaction hashes start with 0x')}</li>
            <li>{t('Account addresses start with T')}</li>
            <li>{t('Use Auto Detect to search any type automatically')}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

AdvancedSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AdvancedSearch;
