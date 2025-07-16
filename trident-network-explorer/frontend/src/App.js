import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function LatestBlock() {
  const [block, setBlock] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/api/v1/blocks/latest`)
      .then(res => res.json())
      .then(setBlock);
  }, []);
  if (!block) return <p>Loading latest block...</p>;
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

function AccountLookup() {
  const [address, setAddress] = useState('');
  const [account, setAccount] = useState(null);
  const lookup = () => {
    fetch(`${API_URL}/api/v1/accounts/${address}`)
      .then(res => res.json())
      .then(setAccount);
  };
  return (
    <div>
      <h2>Account Lookup</h2>
      <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Address" />
      <button onClick={lookup}>Lookup</button>
      {account && (
        <div>
          <p>Balance: {account.balance} TRI</p>
          <h4>Transactions</h4>
          <ul>
            {account.transactions.map(tx => (
              <li key={tx.txid}>{tx.txid} - {tx.type} {tx.amount} TRI at {tx.timestamp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function ValidatorList() {
  const [vals, setVals] = useState([]);
  useEffect(() => {
    fetch(`${API_URL}/api/v1/validators`)
      .then(res => res.json())
      .then(setVals);
  }, []);
  return (
    <div>
      <h2>Validators</h2>
      <ul>
        {vals.map(v => (
          <li key={v.address}>{v.address} - power {v.power} - {v.status}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'Arial', backgroundColor: '#001f3f', color: 'white', minHeight: '100vh' }}>
      <h1>Trident Network Explorer</h1>
      <LatestBlock />
      <AccountLookup />
      <ValidatorList />
    </div>
  );
}

export default App;
