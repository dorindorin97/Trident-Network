import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BlockSkeleton } from './SkeletonLoader';
import { useWebSocket } from '../hooks/useWebSocket';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

const REFRESH = parseInt(process.env.REACT_APP_REFRESH_INTERVAL, 10) || 10000;

function LatestBlock() {
  const { t } = useTranslation();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // WebSocket for real-time updates
  const wsUrl = process.env.REACT_APP_BACKEND_URL?.replace(/^http/, 'ws') + '/ws';
  const { data: wsData, connected } = useWebSocket(wsUrl, ['blocks'], !!wsUrl);

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

  // Update block from WebSocket if available
  useEffect(() => {
    if (wsData?.type === 'new_block' && wsData.data) {
      setBlock(wsData.data);
      setLoading(false);
    }
  }, [wsData]);

  if (loading && !block) return <BlockSkeleton />;
  if (error) return <p className="error">{error}</p>;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('Latest Block')}</h2>
        {connected && <span style={{ color: '#2ed573', fontSize: '0.85rem' }}>🟢 Live</span>}
      </div>
      <p>
        {t('Number')}: <Link to={`/block/${block.number}`}>{block.number}</Link>
      </p>
      <p>{t('Hash')}: {block.hash}</p>
      <p>{t('Validator')}: {block.validator}</p>
      <p>{t('Timestamp')}: {block.timestamp}</p>
    </div>
  );
}

export default LatestBlock;
