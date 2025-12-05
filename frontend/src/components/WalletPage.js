import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useApi } from '../hooks/useApi';
import Spinner from './Spinner';
import CopyButton from './CopyButton';

const API_URL = process.env.REACT_APP_BACKEND_URL;


function WalletPage({ wallet, login, logout }) {
  const { t } = useTranslation();
  const [privKey, setPrivKey] = useState('');

  const accountUrl = wallet ? `${API_URL}/api/v1/accounts/${wallet.address}` : null;
  const { data: account, loading, error } = useApi(accountUrl, {}, !!wallet);

  const handleLogin = () => {
    if (privKey && privKey.trim()) {
      login(privKey.trim());
      setPrivKey('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
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
          onKeyPress={handleKeyPress}
          placeholder={t('Private Key')}
          aria-label={t('Private Key')}
        />
        <button onClick={handleLogin} className="ml-sm" disabled={!privKey.trim()}>{t('Login')}</button>
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
        <p className="error">{t('Service unavailable')}: {error}</p>
      ) : account ? (
        <div>
          <p>{t('Balance')}: {account.balance || 0} TRI</p>
          <h4>{t('Transactions')}</h4>
          {!account.transactions || account.transactions.length === 0 ? (
            <p>{t('No transactions found')}</p>
          ) : (
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
          )}
        </div>
      ) : null}
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
