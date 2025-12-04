import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';

function AccountLookup() {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const lookup = async () => {
    setLoading(true);
    try {
      const data = await fetchApi(`${API_BASE_PATH}/accounts/${address}`);
      setAccount(data);
      setPage(1);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setAccount(null);
    } finally {
      setLoading(false);
    }
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
      {error && !loading && <p className="error">{error}</p>}
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
      )}
    </div>
  );
}

export default AccountLookup;
