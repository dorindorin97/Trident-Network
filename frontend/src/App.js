import React, { useState, useEffect, lazy, Suspense } from 'react';
import { deriveAddress } from './utils';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import './App.css';
import './i18n';

import NavBar from './components/NavBar';
import Home from './components/Home';
import ErrorBoundary from './components/ErrorBoundary';
import Spinner from './components/Spinner';
import { ToastProvider } from './components/Toast';
import Footer from './components/Footer';
import PerformanceMonitor from './components/PerformanceMonitor';
import SettingsPanel from './components/SettingsPanel';
import NetworkStatus from './components/NetworkStatus';
import LoadingBar from './components/LoadingBar';

// Lazy load components for code splitting
const AccountLookup = lazy(() => import('./components/AccountLookup'));
const ValidatorList = lazy(() => import('./components/ValidatorList'));
const WalletPage = lazy(() => import('./components/WalletPage'));
const NotFound = lazy(() => import('./components/NotFound'));
const BlockDetails = lazy(() => import('./components/BlockDetails'));
const TransactionDetails = lazy(() => import('./components/TransactionDetails'));
const AccountPage = lazy(() => import('./components/AccountPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));


function App() {
  useTranslation(); // initialize i18n
  const [wallet, setWallet] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
    setWallet({ privateKey: privKey, address: addr });
  };

  const logout = () => {
    setWallet(null);
  };

  return (
    <ToastProvider>
      <Router>
        <LoadingBar />
        <NavBar
          wallet={wallet}
          logout={logout}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggleTheme}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <SettingsPanel
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          language={language}
          setLanguage={setLanguage}
        />
        <ErrorBoundary>
          <Suspense fallback={<div className="container"><Spinner /></div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/account" element={<div className="container"><AccountLookup /></div>} />
              <Route path="/validators" element={<ValidatorList />} />
              <Route path="/wallet" element={<WalletPage wallet={wallet} login={login} logout={logout} />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/block/:number" element={<BlockDetails />} />
              <Route path="/tx/:id" element={<TransactionDetails />} />
              <Route path="/account/:address" element={<AccountPage />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
        <NetworkStatus refreshInterval={15000} />
        <PerformanceMonitor enabled={localStorage.getItem('showPerformance') === 'true'} />
      </Router>
    </ToastProvider>
  );
}

export default App;
