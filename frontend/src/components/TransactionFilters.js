import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './TransactionFilters.css';

/**
 * Transaction filter component with date range and amount filters
 */
function TransactionFilters({ onFilterChange, onReset }) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: '',
    type: 'all' // all, sent, received
  });

  const handleChange = (field, value) => {
    setFilters(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: '',
      type: 'all'
    };
    setFilters(resetFilters);
    onReset();
  };

  return (
    <div className="transaction-filters">
      <div className="filter-row">
        <div className="filter-group">
          <label>{t('Date From')}</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleChange('dateFrom', e.target.value)}
            max={filters.dateTo || undefined}
          />
        </div>
        
        <div className="filter-group">
          <label>{t('Date To')}</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleChange('dateTo', e.target.value)}
            min={filters.dateFrom || undefined}
          />
        </div>
        
        <div className="filter-group">
          <label>{t('Min Amount')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={filters.minAmount}
            onChange={(e) => handleChange('minAmount', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>{t('Max Amount')}</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={filters.maxAmount}
            onChange={(e) => handleChange('maxAmount', e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <label>{t('Type')}</label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            <option value="all">{t('All')}</option>
            <option value="sent">{t('Sent')}</option>
            <option value="received">{t('Received')}</option>
          </select>
        </div>
      </div>
      
      <div className="filter-actions">
        <button onClick={handleApply} className="btn-primary">
          {t('Apply Filters')}
        </button>
        <button onClick={handleReset} className="btn-secondary ml-sm">
          {t('Reset')}
        </button>
      </div>
    </div>
  );
}

TransactionFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired
};

export default TransactionFilters;
