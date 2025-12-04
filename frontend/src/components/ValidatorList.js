import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import CopyButton from './CopyButton';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';
import { exportCSV, formatValidatorsForExport } from '../utils/export';

function ValidatorList() {
  const { t } = useTranslation();
  const [vals, setVals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('power'); // power, status, address
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  useEffect(() => {
    const fetchValidators = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`${API_BASE_PATH}/validators`);
        setVals(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchValidators();
  }, []);

  // Filter and sort validators
  const processedValidators = useMemo(() => {
    let filtered = vals;
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(v => 
        v.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'power':
          compareValue = (a.power || 0) - (b.power || 0);
          break;
        case 'status':
          compareValue = (a.status || '').localeCompare(b.status || '');
          break;
        case 'address':
          compareValue = (a.address || '').localeCompare(b.address || '');
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [vals, sortBy, sortOrder, filterStatus]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    const formatted = formatValidatorsForExport(processedValidators);
    exportCSV(formatted, `validators_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>{t('Validators')}</h2>
        {!loading && !error && processedValidators.length > 0 && (
          <button onClick={handleExport} className="btn-primary">
            📥 {t('Export CSV')}
          </button>
        )}
      </div>

      {!loading && !error && vals.length > 0 && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>
            {t('Filter')}:
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="all">{t('All')}</option>
              <option value="active">{t('Active')}</option>
              <option value="inactive">{t('Inactive')}</option>
            </select>
          </label>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('Showing')} {processedValidators.length} {t('of')} {vals.length} {t('validators')}
          </span>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="error">{error}</p>
      ) : processedValidators.length === 0 ? (
        <p>{t('No validators found')}</p>
      ) : (
        <table className="full-width">
          <thead>
            <tr>
              <th onClick={() => handleSort('address')} style={{ cursor: 'pointer' }}>
                {t('Address')} {getSortIcon('address')}
              </th>
              <th onClick={() => handleSort('power')} style={{ cursor: 'pointer' }}>
                {t('Power')} {getSortIcon('power')}
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                {t('Status')} {getSortIcon('status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {processedValidators.map(v => (
              <tr key={v.address}>
                <td>
                  {v.address}
                  <CopyButton value={v.address} />
                </td>
                <td>{v.power}</td>
                <td>
                  <span className={`status-badge ${v.status.toLowerCase()}`}>
                    {v.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ValidatorList;
