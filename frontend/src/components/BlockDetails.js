import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import CopyButton from './CopyButton';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';
import { exportCSV, formatTransactionsForExport } from '../utils/export';

function BlockDetails() {
  const { t } = useTranslation();
  const { number } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    const fetchBlock = async () => {
      setLoading(true);
      setCurrentPage(1); // Reset pagination on new block
      try {
        const endpoint = number.startsWith('0x') ?
          `${API_BASE_PATH}/blocks/hash/${number}` :
          `${API_BASE_PATH}/blocks/${number}`;
        const data = await fetchApi(endpoint);
        setBlock(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
  }, [number]);

  // Paginate transactions
  const { paginatedTransactions, totalPages } = useMemo(() => {
    if (!block || !block.transactions) return { paginatedTransactions: [], totalPages: 0 };
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = block.transactions.slice(startIndex, endIndex);
    const pages = Math.ceil(block.transactions.length / itemsPerPage);
    
    return { paginatedTransactions: paginated, totalPages: pages };
  }, [block, currentPage, itemsPerPage]);

  const handleExportTransactions = () => {
    if (!block || !block.transactions) return;
    const formatted = formatTransactionsForExport(block.transactions);
    exportCSV(formatted, `block_${block.number}_transactions.csv`);
  };

  if (loading) return <Spinner />;
  if (error || !block) return <p className="error">{error || t('Block not found')}</p>;

  const hasMultiplePages = block.transactions && block.transactions.length > itemsPerPage;

  return (
    <div className="container">
      <h2>{t('Block')} {block.number}</h2>
      <div style={{ marginBottom: '1rem' }}>
        <p><strong>{t('Hash')}:</strong> {block.hash} <CopyButton value={block.hash} /></p>
        <p><strong>{t('Validator')}:</strong> {block.validator} <CopyButton value={block.validator} /></p>
        <p><strong>{t('Timestamp')}:</strong> {block.timestamp}</p>
        <p><strong>{t('Transactions')}:</strong> {block.transactions ? block.transactions.length : 0}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ margin: 0 }}>{t('Transactions')}</h4>
        {block.transactions && block.transactions.length > 0 && (
          <button onClick={handleExportTransactions} className="btn-primary">
            📥 {t('Export CSV')}
          </button>
        )}
      </div>

      {hasMultiplePages && (
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label>
            {t('Items per page')}:
            <select 
              value={itemsPerPage} 
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{ marginLeft: '0.5rem' }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </label>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('Page')} {currentPage} {t('of')} {totalPages}
          </span>
        </div>
      )}

      {!block.transactions || block.transactions.length === 0 ? (
        <p>{t('No transactions found')}</p>
      ) : (
        <>
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
              {paginatedTransactions.map(tx => (
                <tr key={tx.txId}>
                  <td>
                    <Link to={`/tx/${tx.txId}`}>{tx.txId.slice(0, 16)}...</Link>
                    <CopyButton value={tx.txId} />
                  </td>
                  <td>
                    <Link to={`/account/${tx.from}`}>{tx.from.slice(0, 12)}...</Link>
                    <CopyButton value={tx.from} />
                  </td>
                  <td>
                    <Link to={`/account/${tx.to}`}>{tx.to.slice(0, 12)}...</Link>
                    <CopyButton value={tx.to} />
                  </td>
                  <td>{tx.amount}</td>
                  <td>{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {hasMultiplePages && (
            <div className="pagination-controls" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setCurrentPage(1)} 
                disabled={currentPage === 1}
                className="btn-primary"
              >
                ⏮ {t('First')}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1}
                className="btn-primary"
              >
                ← {t('Previous')}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages}
                className="btn-primary"
              >
                {t('Next')} →
              </button>
              <button 
                onClick={() => setCurrentPage(totalPages)} 
                disabled={currentPage === totalPages}
                className="btn-primary"
              >
                {t('Last')} ⏭
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BlockDetails;
