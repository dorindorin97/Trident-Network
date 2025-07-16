import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function AccountPage() {
  const { t } = useTranslation();
  const { address } = useParams();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetch(`${API_URL}/api/v1/accounts/${address}`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setAccount(data);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setAccount(null);
        setError(true);
        setLoading(false);
      });
  }, [address]);

  if (loading) return <Spinner />;
  if (error || !account) return <p>{t('Service unavailable')}</p>;

  const total = Math.ceil(account.transactions.length / perPage);
  const start = (page - 1) * perPage;
  const end = start + perPage;
  const txs = account.transactions.slice(start, end);

  return (
    <div className="container">
      <h2>{t('Account')} {address}</h2>
      <p>{t('Balance')}: {account.balance} TRI</p>
      <h4>{t('Transactions')}</h4>
      <div className="pagination-controls">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>{t('Previous')}</button>
        <span className="ml-sm">{t('Page')} {page} {t('of')} {total}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={page >= total} className="ml-sm">{t('Next')}</button>
      </div>
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
          {txs.map(tx => (
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

export default AccountPage;
