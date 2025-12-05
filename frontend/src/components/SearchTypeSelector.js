import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Search type selector component
 * Renders buttons for selecting search type (auto-detect, block, transaction, account)
 */
function SearchTypeSelector({ searchType, onTypeChange }) {
  const { t } = useTranslation();

  const types = [
    { value: 'all', label: 'Auto Detect' },
    { value: 'block', label: 'Block' },
    { value: 'transaction', label: 'Transaction' },
    { value: 'account', label: 'Account' }
  ];

  return (
    <div className="form-group">
      <label>{t('Search Type')}</label>
      <div className="search-type-buttons">
        {types.map(type => (
          <button
            key={type.value}
            type="button"
            className={searchType === type.value ? 'active' : ''}
            onClick={() => onTypeChange(type.value)}
          >
            {t(type.label)}
          </button>
        ))}
      </div>
    </div>
  );
}

SearchTypeSelector.propTypes = {
  searchType: PropTypes.string.isRequired,
  onTypeChange: PropTypes.func.isRequired
};

export default SearchTypeSelector;
