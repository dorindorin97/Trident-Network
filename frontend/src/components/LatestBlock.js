import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

const REFRESH = parseInt(process.env.REACT_APP_REFRESH_INTERVAL, 10) || 10000;

function LatestBlock() {
  const { t } = useTranslation();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlock = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`${API_BASE_PATH}/blocks/latest`);
        setBlock(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchBlock();
    const interval = setInterval(fetchBlock, REFRESH);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Spinner />;
  if (error) return <p className="error">{error}</p>;
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
