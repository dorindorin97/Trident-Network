import React, { lazy, Suspense, useState } from 'react';
import { deriveAddress } from './utils';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './App.css';
import './i18n';

// Context & hooks
import {
  AppContextProvider,
  useTheme,
  useLanguage,
  usePreferences,
  useNotification,
  useLoadingState,
  useErrorState,
  useOnlineStatus,
} from './context/AppContext';

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

function AppContent() {
  useTranslation(); // initialize i18n
  // Theme/language are available via context in components (NavBar, etc.)
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { preferences } = usePreferences();
  const { showToast } = useNotification();

  const [wallet, setWallet] = useState(null);

  const login = (privKey) => {
    const addr = deriveAddress(privKey);
    setWallet({ privateKey: privKey, address: addr });
    showToast && showToast('Wallet connected', 'success');
  };

  const logout = () => {
    setWallet(null);
    showToast && showToast('Wallet disconnected', 'info');
  };
  const { isLoading } = useLoadingState();
  const { error, clearError } = useErrorState();
  const { isOnline } = useOnlineStatus();

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
        onSettingsClick={() => {}}
      />
      <div className="container">
        <Breadcrumb />
      </div>
      <SettingsPanel />
      <AdvancedSearch />
      {isLoading && <Spinner />}
      {error && (
        <div className="error-banner" role="alert">
          <span>{error.message || error}</span>
          <button onClick={clearError} aria-label="Dismiss error">×</button>
        </div>
      )}
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
      <NetworkStatus refreshInterval={preferences.refreshInterval || 15000} />
      <PerformanceMonitor enabled={preferences.showPerformanceMonitor} />
      <div className="online-status" aria-live="polite">
        {isOnline ? 'Online' : 'Offline'}
      </div>
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </ToastProvider>
  );
}

export default App;
