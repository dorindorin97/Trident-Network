import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useClickOutside } from '../hooks/useCommon';
import { detectSearchType, getNavigationPath } from '../utils/searchValidation';
import SearchTypeSelector from './SearchTypeSelector';
import RangeFilter from './RangeFilter';
import SearchHints from './SearchHints';
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
    amountRange: { min: '', max: '' }
  });
  const [error, setError] = useState('');

  const modalRef = useClickOutside(onClose);

  const handleSearch = (e) => {
    e.preventDefault();
    setError('');

    const { type, isValid, error: validationError } = detectSearchType(query, searchType);

    if (!isValid) {
      setError(t(validationError));
      return;
    }

    const path = getNavigationPath(type, query);
    if (!path) {
      setError(t('Invalid search query'));
      return;
    }

    navigate(path);
    onClose();
  };

  const handleReset = () => {
    setQuery('');
    setSearchType('all');
    setFilters({
      blockRange: { min: '', max: '' },
      dateRange: { from: '', to: '' },
      amountRange: { min: '', max: '' }
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
          <SearchTypeSelector searchType={searchType} onTypeChange={setSearchType} />

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
            <SearchHints searchType={searchType} />
          </div>

          {/* Advanced Filters */}
          <div className="advanced-filters">
            <h3>{t('Filters')} <span className="optional">({t('Optional')})</span></h3>

            {/* Block Range Filter */}
            <RangeFilter
              label="Block Range"
              minValue={filters.blockRange.min}
              maxValue={filters.blockRange.max}
              minPlaceholder="Min"
              maxPlaceholder="Max"
              onChange={(range) => setFilters(f => ({ ...f, blockRange: range }))}
              type="number"
            />

            {/* Date Range Filter */}
            <RangeFilter
              label="Date Range"
              minValue={filters.dateRange.from}
              maxValue={filters.dateRange.to}
              minPlaceholder="From"
              maxPlaceholder="To"
              onChange={(range) => setFilters(f => ({ ...f, dateRange: range }))}
              type="date"
            />

            {/* Amount Range Filter (for transactions) */}
            {(searchType === 'transaction' || searchType === 'all') && (
              <RangeFilter
                label="Amount Range"
                minValue={filters.amountRange.min}
                maxValue={filters.amountRange.max}
                minPlaceholder="Min Amount"
                maxPlaceholder="Max Amount"
                onChange={(range) => setFilters(f => ({ ...f, amountRange: range }))}
                type="number"
              />
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
      </div>
    </div>
  );
}

AdvancedSearch.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AdvancedSearch;
