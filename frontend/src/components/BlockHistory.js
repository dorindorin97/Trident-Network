import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function BlockHistory() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks?page=${page}&limit=10`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setBlocks(data.blocks);
        setTotal(Math.ceil(data.total / data.limit));
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
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
        <p>{t('Service unavailable')}</p>
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
