import React, { useState, lazy, Suspense } from 'react';
import { deriveAddress } from './utils';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n';

// Context & hooks
import { AppContextProvider, useTheme, useLanguage } from './context/AppContext';

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
import Breadcrumb from './components/Breadcrumb';
import ScrollToTop from './components/ScrollToTop';
import AdvancedSearch from './components/AdvancedSearch';

// Lazy load components for code splitting
const AccountLookup = lazy(() => import('./components/AccountLookup'));
const ValidatorList = lazy(() => import('./components/ValidatorList'));
const WalletPage = lazy(() => import('./components/WalletPage'));
const NotFound = lazy(() => import('./components/NotFound'));
const BlockDetails = lazy(() => import('./components/BlockDetails'));
const TransactionDetails = lazy(() => import('./components/TransactionDetails'));
const AccountPage = lazy(() => import('./components/AccountPage'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TransactionGraph = lazy(() => import('./components/TransactionGraph'));
const NotificationPreferences = lazy(() => import('./components/NotificationPreferences'));

/**
 * AppContent - Main app content using context hooks
 */
function AppContent() {
  useTranslation(); // initialize i18n
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [wallet, setWallet] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [advancedSearchOpen, setAdvancedSearchOpen] = useState(false);

  const login = privKey => {
    const addr = deriveAddress(privKey);
    setWallet({ privateKey: privKey, address: addr });
  };

  const logout = () => {
    setWallet(null);
  };

  return (
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
        onAdvancedSearchClick={() => setAdvancedSearchOpen(true)}
      />
      <div className="container">
        <Breadcrumb />
      </div>
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <AdvancedSearch
        isOpen={advancedSearchOpen}
        onClose={() => setAdvancedSearchOpen(false)}
      />
      <ErrorBoundary>
        <Suspense fallback={<div className="container"><Spinner /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/account" element={<div className="container"><AccountLookup /></div>} />
            <Route path="/validators" element={<ValidatorList />} />
            <Route path="/wallet" element={<WalletPage wallet={wallet} login={login} logout={logout} />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/analytics" element={<div className="container"><TransactionGraph /></div>} />
            <Route path="/notifications" element={<div className="container"><NotificationPreferences /></div>} />
            <Route path="/block/:number" element={<BlockDetails />} />
            <Route path="/tx/:id" element={<TransactionDetails />} />
            <Route path="/account/:address" element={<AccountPage />} />
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
      <Footer />
      <ScrollToTop />
      <NetworkStatus refreshInterval={15000} />
      <PerformanceMonitor enabled={localStorage.getItem('showPerformance') === 'true'} />
    </Router>
  );
}

/**
 * App - Root component with providers
 */
function App() {
  return (
    <ToastProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ToastProvider>
  );
}
