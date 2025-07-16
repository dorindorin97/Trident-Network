import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function BlockDetails() {
  const { t } = useTranslation();
  const { number } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks/${number}`)
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
  }, [number]);

  if (loading) return <Spinner />;
  if (error || !block) return <p>{t('Service unavailable')}</p>;

  return (
    <div className="container">
      <h2>{t('Block')} {block.number}</h2>
      <p>{t('Hash')}: {block.hash}</p>
      <p>{t('Validator')}: {block.validator}</p>
      <p>{t('Timestamp')}: {block.timestamp}</p>
      <h4>{t('Transactions')}</h4>
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
          {block.transactions.map(tx => (
            <tr key={tx.txId}>
              <td><Link to={`/tx/${tx.txId}`}>{tx.txId}</Link></td>
              <td><Link to={`/account/${tx.from}`}>{tx.from}</Link></td>
              <td><Link to={`/account/${tx.to}`}>{tx.to}</Link></td>
              <td>{tx.amount}</td>
              <td>{tx.timestamp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BlockDetails;
