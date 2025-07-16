import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function Spinner() {
  return <div className="spinner" />;
}

function LatestBlock() {
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks/latest`)
      .then(res => res.json())
      .then(data => {
        setBlock(data);
        setLoading(false);
      });
  }, []);
  if (loading) return <Spinner />;
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

  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/blocks?page=${page}&limit=10`)
      .then(res => res.json())
      .then(data => {
        setBlocks(data.blocks);
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
  const lookup = () => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/accounts/${address}`)
      .then(res => res.json())
      .then(data => {
        setAccount(data);
        setLoading(false);
      });
  };
  return (
    <div>
      <h2>Account Lookup</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
      <button onClick={lookup}>Lookup</button>
      {loading && <Spinner />}
      {account && !loading && (
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
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/v1/validators`)
      .then(res => res.json())
      .then(data => {
        setVals(data);
        setLoading(false);
      });
  }, []);
  return (
    <div>
      <h2>Validators</h2>
      {loading ? (
        <Spinner />
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

function NavBar() {
  return (
    <nav className="navbar">
      <img src="/trident-logo.svg" alt="Trident" />
      <Link to="/">Latest Block</Link>
      <Link to="/account">Account Lookup</Link>
      <Link to="/validators">Validator List</Link>
      <Link to="/admin">Admin</Link>
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
  useEffect(() => {
    fetch(`${API_URL}/api/v1/health`)
      .then(res => res.json())
      .then(setHealth);
    fetch(`${API_URL}/api/v1/env`)
      .then(res => res.json())
      .then(setEnv);
  }, []);
  return (
    <div className="container">
      <h2>Admin Panel</h2>
      {!health ? <Spinner /> : (
        <p>Status: {health.status} at {health.timestamp}</p>
      )}
      {!env ? <Spinner /> : (
        <div>
          <h3>Environment</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(env, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/account" element={<div className="container"><AccountLookup /></div>} />
        <Route path="/validators" element={<div className="container"><ValidatorList /></div>} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
