import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const REFRESH = parseInt(process.env.REACT_APP_REFRESH_INTERVAL, 10) || 10000;

function LatestBlock() {
  const { t } = useTranslation();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlock = () => {
      setLoading(true);
      fetch(`${API_URL}/api/v1/blocks/latest`)
        .then(res => {
          if (!res.ok) throw new Error('bad');
          return res.json();
        })
        .then(data => {
          setBlock(data);
          setError(false);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    };
    fetchBlock();
    const interval = setInterval(fetchBlock, REFRESH);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p>{t('Service unavailable')}</p>;
  return (
    <div>
      <h2>{t('Latest Block')}</h2>
      <p>{t('Number')}: {block.number}</p>
      <p>{t('Hash')}: {block.hash}</p>
      <p>{t('Validator')}: {block.validator}</p>
      <p>{t('Timestamp')}: {block.timestamp}</p>
    </div>
  );
}

export default LatestBlock;
