import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
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
      <div className="pagination-controls">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('Previous')}</button>
        <span className="ml-sm">{t('Page')} {page} {t('of')} {total}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= total} className="ml-sm">{t('Next')}</button>
      </div>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <ul>
          {blocks.map(b => (
            <li key={b.number}>
              <Link to={`/block/${b.number}`}>{t('Block')} {b.number}</Link> - {b.validator} - {b.timestamp}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default BlockHistory;
