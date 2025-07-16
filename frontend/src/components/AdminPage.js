import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function AdminPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/health`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setHealth(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  return (
    <div className="container">
      <h2>{t('Admin Panel')}</h2>
      {!health ? <Spinner /> : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        <p>{t('Status')}: {health.status} {t('Timestamp')}: {health.timestamp}</p>
      )}
    </div>
  );
}

export default AdminPage;
