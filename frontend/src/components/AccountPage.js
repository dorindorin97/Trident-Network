import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import CopyButton from './CopyButton';
import { QRCodeButton } from './QRCodeModal';
import TransactionFilters from './TransactionFilters';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function AccountPage() {
  const { t } = useTranslation();
  const { address } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const abortControllerRef = useRef(null);

  // Cleanup function for aborting requests on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Memoized fetch function
  const fetchAccount = useCallback(async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const data = await fetchApi(
        `${API_BASE_PATH}/accounts/${address}?page=${page}&limit=${limit}`,
        { signal: abortControllerRef.current.signal }
      );
      setAccount(data);
      setError(null);
    } catch (err) {
      // Don't set error if request was aborted
      if (err.name !== 'AbortError') {
        setError(getErrorMessage(err));
        setAccount(null);
      }
    } finally {
      setLoading(false);
    }
  }, [address, page, limit]);

  useEffect(() => {
    fetchAccount();
  }, [fetchAccount]);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Memoized filter function
  const filterTransactions = useCallback((transactions) => {
    if (!transactions) return [];

    return transactions.filter(tx => {
      // Date filters
      if (filters.dateFrom && new Date(tx.timestamp) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && new Date(tx.timestamp) > new Date(filters.dateTo)) return false;

      // Amount filters
      const amount = parseFloat(tx.amount) || 0;
      if (filters.minAmount && amount < parseFloat(filters.minAmount)) return false;
      if (filters.maxAmount && amount > parseFloat(filters.maxAmount)) return false;

      // Type filter
      if (filters.type === 'sent' && tx.from !== address) return false;
      if (filters.type === 'received' && tx.to !== address) return false;

      return true;
    });
  }, [address, filters]);

  // Memoize filtered transactions
  const filteredTxs = useMemo(() => filterTransactions(account?.transactions || []), [filterTransactions, account?.transactions]);

  if (loading) return <Spinner />;
  if (error || !account) return <p className="error">{error || t('Account not found')}</p>;

  const pagination = account.pagination || {};

  return (
    <div className="container">
      <h2>
        {t('Account')} {address}
        <CopyButton value={address} />
        <QRCodeButton value={address} label={`Account: ${address.slice(0, 12)}...`} />
      </h2>
      <p>{t('Balance')}: {account.balance} TRI</p>
      
      <div className="section-header">
        <h4>{t('Transactions')} {pagination.total ? `(${pagination.total})` : ''}</h4>
        <button 
          onClick={() => setShowFilters(!showFilters)} 
          className="btn-secondary ml-sm"
        >
          {showFilters ? t('Hide Filters') : t('Show Filters')}
        </button>
      </div>
      
      {showFilters && (
        <TransactionFilters 
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />
      )}
      
      {pagination.totalPages > 0 && (
        <div className="pagination-controls">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={!pagination.hasPrev || loading}
          >
            {t('Previous')}
          </button>
          <span className="ml-sm">
            {t('Page')} {pagination.page} {t('of')} {pagination.totalPages}
          </span>
          <button 
            onClick={() => setPage(p => p + 1)} 
            disabled={!pagination.hasNext || loading} 
            className="ml-sm"
          >
            {t('Next')}
          </button>
        </div>
      )}
      
      <table className="full-width">
        <thead>
          <tr>
            <th>{t('TxID')}</th>
            <th>{t('From')}</th>
            <th>{t('To')}</th>
            <th>{t('Amount')}</th>
            <th>{t('Timestamp')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredTxs.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                {t('No transactions found')}
              </td>
            </tr>
          ) : (
            filteredTxs.map(tx => (
              <tr key={tx.txId}>
                <td><Link to={`/tx/${tx.txId}`}>{tx.txId}</Link></td>
                <td><Link to={`/account/${tx.from}`}>{tx.from}</Link></td>
                <td><Link to={`/account/${tx.to}`}>{tx.to}</Link></td>
                <td>{tx.amount}</td>
                <td>{tx.timestamp}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default React.memo(AccountPage);
