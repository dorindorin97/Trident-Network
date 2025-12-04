import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function ValidatorList() {
  const { t } = useTranslation();
  const [vals, setVals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchValidators = async () => {
      setLoading(true);
      try {
        const data = await fetchApi(`${API_BASE_PATH}/validators`);
        setVals(data);
        setError(null);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchValidators();
  }, []);

  return (
    <div>
      <h2>{t('Validators')}</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="error">{error}</p>
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
