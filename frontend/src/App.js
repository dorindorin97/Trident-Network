import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import './App.css';
import './i18n';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function deriveAddress(privateKey) {
  return (
    'T' +
    btoa(privateKey)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 10)
  );
}

function Spinner() {
  return <div className="spinner" />;
}

function LatestBlock() {
  const { t } = useTranslation();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks/latest`)
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
  }, []);
  if (loading) return <Spinner />;
  if (error) return <p>{t('Service unavailable')}</p>;
  return (
    <div>
      <h2>{t('Latest Block')}</h2>
      <p>{t('Number')}: {block.number}</p>
      <p>{t('Hash')}: {block.hash}</p>
      <p>{t('Validator')}: {block.validator}</p>
      <p>{t('Timestamp')}: {block.timestamp}</p>
    </div>
  );
}

function BlockHistory() {
  const { t } = useTranslation();
  const [blocks, setBlocks] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks?page=${page}&limit=10`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setBlocks(data.blocks);
        setError(false);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [page]);

  return (
    <div>
      <h2>{t('Block History')}</h2>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>{t('Previous')}</button>
      <button onClick={() => setPage(p => p + 1)} style={{ marginLeft: '0.5rem' }}>{t('Next')}</button>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        <ul>
          {blocks.map(b => (
            <li key={b.number}>{t('Block')} {b.number} - {b.validator} - {b.timestamp}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountLookup() {
  const { t } = useTranslation();
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const lookup = () => {
    setLoading(true);
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
  };
  return (
    <div>
      <h2>{t('Account Lookup')}</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder={t('Address')} />
      <button onClick={lookup}>{t('Lookup')}</button>
      {loading && <Spinner />}
      {error && !loading && <p>{t('Service unavailable')}</p>}
      {account && !loading && !error && (
        <div>
          <p>{t('Balance')}: {account.balance} TRI</p>
          <h4>{t('Transactions')}</h4>
          <table style={{ width: '100%', color: 'white' }}>
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
                  <td>{tx.txId}</td>
                  <td>{tx.from}</td>
                  <td>{tx.to}</td>
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

function WalletPage({ wallet, login, logout }) {
  const { t } = useTranslation();
  const [privKey, setPrivKey] = useState('');
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);

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
        <button onClick={handleLogin}>{t('Login')}</button>
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
            <table style={{ width: '100%', color: 'white' }}>
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
                    <td>{tx.txId}</td>
                    <td>{tx.from}</td>
                    <td>{tx.to}</td>
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

const APP_TITLE = process.env.REACT_APP_APP_TITLE || 'Trident Explorer';

function NavBar({ wallet, logout, language, setLanguage, theme, toggleTheme }) {
  const { t } = useTranslation();
  return (
    <nav className="navbar">
      <img src="/trident-logo.svg" alt={APP_TITLE} />
      <span className="brand">{APP_TITLE}</span>
      <Link to="/">{t('Latest Block')}</Link>
      <Link to="/account">{t('Account Lookup')}</Link>
      <Link to="/validators">{t('Validator List')}</Link>
      <Link to="/wallet">{t('Wallet')}</Link>
      <Link to="/admin">{t('Admin Panel')}</Link>
      <select value={language} onChange={e => setLanguage(e.target.value)} style={{ marginLeft: 'auto' }}>
        <option value="en">EN</option>
        <option value="pt">PT</option>
      </select>
      <button onClick={toggleTheme} style={{ marginLeft: '0.5rem' }}>
        {theme === 'dark' ? t('Light Mode') : t('Dark Mode')}
      </button>
      {wallet && (
        <span style={{ marginLeft: '0.5rem' }}>
          {wallet.address}{' '}
          <button onClick={logout}>{t('Logout')}</button>
        </span>
      )}
    </nav>
  );
}

function Home() {
  return (
    <div className="container">
      <LatestBlock />
      <BlockHistory />
    </div>
  );
}

function AdminPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState(null);
  const [env, setEnv] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/api/v1/health`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setHealth(data);
        setError(false);
      })
      .catch(() => setError(true));
    fetch(`${API_URL}/api/v1/env`)
      .then(res => {
        if (!res.ok) throw new Error('bad');
        return res.json();
      })
      .then(data => {
        setEnv(data);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);
  return (
    <div className="container">
      <h2>{t('Admin Panel')}</h2>
      {!health ? <Spinner /> : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        <p>{t('Status')}: {health.status} {t('Timestamp')}: {health.timestamp}</p>
      )}
      {!env ? <Spinner /> : error ? (
        <p>{t('Service unavailable')}</p>
      ) : (
        <div>
          <h3>{t('Environment')}</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(env, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function App() {
  const [wallet, setWallet] = useState(() => {
    const pk = localStorage.getItem('privateKey');
    if (pk) {
      return { privateKey: pk, address: deriveAddress(pk) };
    }
    return null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || process.env.REACT_APP_DEFAULT_THEME || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || process.env.REACT_APP_DEFAULT_LANGUAGE || 'en';
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  }, [language]);

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const login = privKey => {
    const addr = deriveAddress(privKey);
    localStorage.setItem('privateKey', privKey);
    setWallet({ privateKey: privKey, address: addr });
  };

  const logout = () => {
    localStorage.removeItem('privateKey');
    setWallet(null);
  };

  return (
    <Router>
      <NavBar
        wallet={wallet}
        logout={logout}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<div className="container"><AccountLookup /></div>} />
        <Route path="/validators" element={<div className="container"><ValidatorList /></div>} />
        <Route path="/wallet" element={<WalletPage wallet={wallet} login={login} logout={logout} />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
