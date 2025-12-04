import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import Spinner from './Spinner';
import CopyButton from './CopyButton';

const API_URL = process.env.REACT_APP_BACKEND_URL;


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
      <p className="warning">{t('This explorer is connected to a testnet. Do not use real assets.')}</p>
      <p className="warning">{t('Use test accounts only. Keys stay in browser memory.')}</p>
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
      <p className="warning">{t('This explorer is connected to a testnet. Do not use real assets.')}</p>
      <p>{t('Address')}: {wallet.address} <CopyButton value={wallet.address} /></p>
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
                    <td>
                      <Link to={`/tx/${tx.txId}`}>{tx.txId}</Link>
                      <CopyButton value={tx.txId} />
                    </td>
                    <td>
                      <Link to={`/account/${tx.from}`}>{tx.from}</Link>
                      <CopyButton value={tx.from} />
                    </td>
                    <td>
                      <Link to={`/account/${tx.to}`}>{tx.to}</Link>
                      <CopyButton value={tx.to} />
                    </td>
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

WalletPage.propTypes = {
  wallet: PropTypes.shape({
    address: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired
  }),
  login: PropTypes.func.isRequired,
  logout: PropTypes.func.isRequired
};

export default WalletPage;
