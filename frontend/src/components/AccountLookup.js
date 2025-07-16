import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function AccountLookup() {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const lookup = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/accounts/${address}`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setAccount(data);
        setPage(1);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setAccount(null);
        setError(true);
        setLoading(false);
      });
  };

  let total = 1;
  let txs = [];
  if (account) {
    total = Math.ceil(account.transactions.length / perPage);
    const start = (page - 1) * perPage;
    txs = account.transactions.slice(start, start + perPage);
  }

  return (
    <div>
      <h2>{t('Account Lookup')}</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder={t('Address')} />
      <button onClick={lookup} className="ml-sm" disabled={!address.trim()}>{t('Lookup')}</button>
      {loading && <Spinner />}
      {error && !loading && <p>{t('Service unavailable')}</p>}
      {account && !loading && !error && (
        <div>
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
                  <td><a href={`/tx/${tx.txId}`}>{tx.txId}</a></td>
                  <td><a href={`/account/${tx.from}`}>{tx.from}</a></td>
                  <td><a href={`/account/${tx.to}`}>{tx.to}</a></td>
                  <td>{tx.amount}</td>
                  <td>{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AccountLookup;
