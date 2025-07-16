import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from './Spinner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

function deriveAddress(privateKey) {
  return (
    'T' +
    btoa(privateKey)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 10)
  );
}

function WalletPage({ wallet, login, logout }) {
  const { t } = useTranslation();
  const [privKey, setPrivKey] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (wallet) {
      setLoading(true);
      fetch(`${API_URL}/api/v1/accounts/${wallet.address}`)
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
    } else {
      setAccount(null);
    }
  }, [wallet]);

  const handleLogin = () => {
    if (privKey) {
      login(privKey);
      setPrivKey('');
    }
  };

  if (!wallet) {
    return (
      <div className="container">
        <h2>{t('Wallet Login')}</h2>
        <input
          type="password"
          value={privKey}
          onChange={e => setPrivKey(e.target.value)}
          placeholder={t('Private Key')}
        />
        <button onClick={handleLogin} className="ml-sm">{t('Login')}</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>{t('Wallet Page')}</h2>
      <p>{t('Address')}: {wallet.address}</p>
      <button onClick={logout}>{t('Logout')}</button>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        account && (
          <div>
            <p>{t('Balance')}: {account.balance} TRI</p>
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
                {account.transactions.map(tx => (
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
        )
      )}
    </div>
  );
}

export default WalletPage;
