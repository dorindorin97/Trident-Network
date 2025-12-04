import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TableSkeleton } from './SkeletonLoader';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function BlockHistory() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`${API_BASE_PATH}/blocks?page=${page}&limit=10`);
        setBlocks(data.blocks);
        setTotal(Math.ceil(data.total / data.limit));
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, [page]);

  return (
    <div>
      <h2>{t('Block History')}</h2>
      {error && <p className="error">{error}</p>}
      {loading && !blocks.length ? (
        <TableSkeleton rows={10} columns={4} />
      ) : (
        <>
          <table className="full-width">
            <thead>
              <tr>
                <th>{t('Number')}</th>
                <th>{t('Hash')}</th>
                <th>{t('Validator')}</th>
                <th>{t('Timestamp')}</th>
              </tr>
            </thead>
            <tbody>
              {blocks.map(b => (
                <tr key={b.number}>
                  <td><Link to={`/block/${b.number}`}>{b.number}</Link></td>
                  <td>{b.hash?.slice(0, 16)}...</td>
                  <td>{b.validator?.slice(0, 12)}...</td>
                  <td>{b.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="pagination-controls" style={{ marginTop: '1rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1 || loading} className="btn-primary">
              {t('Previous')}
            </button>
            <span style={{ margin: '0 1rem' }}>{t('Page')} {page} {t('of')} {total}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= total || loading} className="btn-primary">
              {t('Next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default BlockHistory;
