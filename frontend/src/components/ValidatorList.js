import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function ValidatorList() {
  const { t } = useTranslation();
  const [vals, setVals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/validators`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setVals(data);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h2>{t('Validators')}</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        <ul>
          {vals.map(v => (
            <li key={v.address}>{v.address} - power {v.power} - {v.status}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ValidatorList;
