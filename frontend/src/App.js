import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import './App.css';
import './i18n';

import NavBar from './components/NavBar';
import Home from './components/Home';
import AccountLookup from './components/AccountLookup';
import ValidatorList from './components/ValidatorList';
import WalletPage from './components/WalletPage';
import NotFound from './components/NotFound';
import BlockDetails from './components/BlockDetails';
import TransactionDetails from './components/TransactionDetails';
import AccountPage from './components/AccountPage';

function deriveAddress(privateKey) {
  return (
    'T' +
    btoa(privateKey)
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 10)
  );
}

function App() {
  const { t } = useTranslation(); // used for initial render and language load
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
        <Route path="/block/:number" element={<BlockDetails />} />
        <Route path="/tx/:id" element={<TransactionDetails />} />
        <Route path="/account/:address" element={<AccountPage />} />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
