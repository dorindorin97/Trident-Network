import React from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Search hints and tips component
 * Displays helpful tips about search format for the selected type
 */
function SearchHints({ searchType }) {
  const { t } = useTranslation();

  const getSearchHint = () => {
    switch (searchType) {
      case 'block':
        return t('Block number or hash (0x...)');
      case 'transaction':
        return t('Transaction hash (0x...)');
      case 'account':
        return t('Account address (T...)');
      case 'all':
      default:
        return t('Any valid block, transaction, or address');
    }
  };

  return (
    <>
      <small className="input-hint">{getSearchHint()}</small>
      <div className="search-tips">
        <h4>{t('Search Tips')}</h4>
        <ul>
          <li>{t('Block numbers are positive integers (e.g., 12345)')}</li>
          <li>{t('Block and transaction hashes start with 0x')}</li>
          <li>{t('Account addresses start with T')}</li>
          <li>{t('Use Auto Detect to search any type automatically')}</li>
        </ul>
      </div>
    </>
  );
}

SearchHints.propTypes = {
  searchType: PropTypes.string.isRequired
};

export default SearchHints;
