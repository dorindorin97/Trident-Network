import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

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
  if (error) return <p>Service unavailable</p>;
  return (
    <div>
      <h2>Latest Block</h2>
      <p>Number: {block.number}</p>
      <p>Hash: {block.hash}</p>
      <p>Validator: {block.validator}</p>
      <p>Timestamp: {block.timestamp}</p>
    </div>
  );
}

function BlockHistory() {
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
      <h2>Block History</h2>
      <button onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
      <button onClick={() => setPage(p => p + 1)} style={{ marginLeft: '0.5rem' }}>Next</button>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>Service unavailable</p>
      ) : (
        <ul>
          {blocks.map(b => (
            <li key={b.number}>Block {b.number} - {b.validator} - {b.timestamp}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AccountLookup() {
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
      <h2>Account Lookup</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
      <button onClick={lookup}>Lookup</button>
      {loading && <Spinner />}
      {error && !loading && <p>Service unavailable</p>}
      {account && !loading && !error && (
        <div>
          <p>Balance: {account.balance} TRI</p>
          <h4>Transactions</h4>
          <table style={{ width: '100%', color: 'white' }}>
            <thead>
              <tr>
                <th>TxID</th>
                <th>From</th>
                <th>To</th>
                <th>Amount</th>
                <th>Timestamp</th>
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
      <h2>Validators</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>Service unavailable</p>
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
        <h2>Wallet Login</h2>
        <input
          type="password"
          value={privKey}
          onChange={e => setPrivKey(e.target.value)}
          placeholder="Private Key"
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Wallet</h2>
      <p>Address: {wallet.address}</p>
      <button onClick={logout}>Logout</button>
      {loading ? (
        <Spinner />
      ) : error ? (
        <p>Service unavailable</p>
      ) : (
        account && (
          <div>
            <p>Balance: {account.balance} TRI</p>
            <h4>Transactions</h4>
            <table style={{ width: '100%', color: 'white' }}>
              <thead>
                <tr>
                  <th>TxID</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Amount</th>
                  <th>Timestamp</th>
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

function NavBar({ wallet, logout }) {
  return (
    <nav className="navbar">
      <img src="/trident-logo.svg" alt="Trident" />
      <Link to="/">Latest Block</Link>
      <Link to="/account">Account Lookup</Link>
      <Link to="/validators">Validator List</Link>
      <Link to="/wallet">Wallet</Link>
      <Link to="/admin">Admin</Link>
      {wallet && (
        <span style={{ marginLeft: 'auto' }}>
          Logged in as {wallet.address}{' '}
          <button onClick={logout}>Logout</button>
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
      <h2>Admin Panel</h2>
      {!health ? <Spinner /> : error ? (
        <p>Service unavailable</p>
      ) : (
        <p>Status: {health.status} at {health.timestamp}</p>
      )}
      {!env ? <Spinner /> : error ? (
        <p>Service unavailable</p>
      ) : (
        <div>
          <h3>Environment</h3>
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
      <NavBar wallet={wallet} logout={logout} />
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
