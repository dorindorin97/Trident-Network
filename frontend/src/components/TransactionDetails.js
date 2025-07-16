import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function TransactionDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/transactions/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setTx(data);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Spinner />;
  if (error || !tx) return <p>{t('Service unavailable')}</p>;

  return (
    <div className="container">
      <h2>{t('Transaction Details')}</h2>
      <p>{t('TxID')}: {tx.txId}</p>
      <p>{t('From')}: <Link to={`/account/${tx.from}`}>{tx.from}</Link></p>
      <p>{t('To')}: <Link to={`/account/${tx.to}`}>{tx.to}</Link></p>
      <p>{t('Amount')}: {tx.amount}</p>
      {tx.blockNumber && <p>{t('Block')}: <Link to={`/block/${tx.blockNumber}`}>{tx.blockNumber}</Link></p>}
      <p>{t('Timestamp')}: {tx.timestamp}</p>
    </div>
  );
}

export default TransactionDetails;
