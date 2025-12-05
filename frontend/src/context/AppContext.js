import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { captureException } from '../utils/errorTracker';
import { deriveAddress } from '../utils';

/**
 * App Context for global state management
 * Handles theme, language, user preferences, and notifications
 */
const AppContext = createContext();

// Initial state
const initialState = {
  // Theme settings
  theme: localStorage.getItem('theme') || 'dark',
  
  // Language settings
  language: localStorage.getItem('language') || 'en',
  
  // User preferences
  preferences: {
    compactMode: localStorage.getItem('compactMode') === 'true',
    autoRefresh: localStorage.getItem('autoRefresh') !== 'false', // default true
    refreshInterval: parseInt(localStorage.getItem('refreshInterval')) || 5000,
    showPerformanceMonitor: localStorage.getItem('showPerformanceMonitor') !== 'false',
    animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false'
  },
  
  // Notifications
  toast: null,
  
  // Loading state
  isLoading: false,
  
  // Error state
  error: null,

  // Wallet
  wallet: typeof window !== 'undefined' && localStorage.getItem('wallet') ? JSON.parse(localStorage.getItem('wallet')) : null,
  
  // Network status
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
};

// Action types
const ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
  SET_WALLET: 'SET_WALLET',
  CLEAR_WALLET: 'CLEAR_WALLET',
  SET_PREFERENCE: 'SET_PREFERENCE',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_ONLINE_STATUS: 'SET_ONLINE_STATUS',
  BATCH_UPDATE: 'BATCH_UPDATE'
};

/**
 * Reducer function for app state
 */
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_THEME: {
      const newTheme = action.payload;
      localStorage.setItem('theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
      return { ...state, theme: newTheme };
    }

    case ACTIONS.SET_LANGUAGE: {
      const newLanguage = action.payload;
      localStorage.setItem('language', newLanguage);
      return { ...state, language: newLanguage };
    }

    case ACTIONS.SET_WALLET: {
      return {
        ...state,
        wallet: action.payload
      };
    }

    case ACTIONS.CLEAR_WALLET: {
      return {
        ...state,
        wallet: null
      };
    }

    case ACTIONS.SET_PREFERENCE: {
      const { key, value } = action.payload;
      localStorage.setItem(key, value);
      return {
        ...state,
        preferences: { ...state.preferences, [key]: value }
      };
    }

    case ACTIONS.SHOW_TOAST: {
      return {
        ...state,
        toast: action.payload
      };
    }

    case ACTIONS.HIDE_TOAST: {
      return {
        ...state,
        toast: null
      };
    }

    case ACTIONS.SET_LOADING: {
      return {
        ...state,
        isLoading: action.payload
      };
    }

    case ACTIONS.SET_ERROR: {
      return {
        ...state,
        error: action.payload
      };
    }

    case ACTIONS.CLEAR_ERROR: {
      return {
        ...state,
        error: null
      };
    }

    case ACTIONS.SET_ONLINE_STATUS: {
      return {
        ...state,
        isOnline: action.payload
      };
    }

    case ACTIONS.BATCH_UPDATE: {
      return { ...state, ...action.payload };
    }

    default:
      return state;
  }
}

/**
 * AppContextProvider component
 */
export function AppContextProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Set initial theme
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, []);

  // Persist wallet to localStorage
  React.useEffect(() => {
    try {
      if (state.wallet) {
        localStorage.setItem('wallet', JSON.stringify(state.wallet));
      } else {
        localStorage.removeItem('wallet');
      }
    } catch (err) {
      try { captureException(err, { source: 'AppContext.persistWallet' }); } catch (_) { /* swallow */ }
    }
  }, [state.wallet]);

  // Monitor online/offline status
  React.useEffect(() => {
    const handleOnline = () => dispatch({ type: ACTIONS.SET_ONLINE_STATUS, payload: true });
    const handleOffline = () => dispatch({ type: ACTIONS.SET_ONLINE_STATUS, payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Action creators
  const setTheme = useCallback((theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }), []);
  const setLanguage = useCallback((language) => dispatch({ type: ACTIONS.SET_LANGUAGE, payload: language }), []);
  const setPreference = useCallback((key, value) => {
    dispatch({ type: ACTIONS.SET_PREFERENCE, payload: { key, value } });
  }, []);
  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    dispatch({ type: ACTIONS.SHOW_TOAST, payload: { message, type, duration, id: Date.now() } });
  }, []);
  const hideToast = useCallback(() => dispatch({ type: ACTIONS.HIDE_TOAST }), []);
  const setLoading = useCallback((isLoading) => dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading }), []);
  const setError = useCallback((error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }), []);
  const clearError = useCallback(() => dispatch({ type: ACTIONS.CLEAR_ERROR }), []);
  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
  }, [state.theme]);
  const toggleCompactMode = useCallback(() => {
    const newValue = !state.preferences.compactMode;
    dispatch({ type: ACTIONS.SET_PREFERENCE, payload: { key: 'compactMode', value: newValue } });
  }, [state.preferences.compactMode]);
  const toggleAutoRefresh = useCallback(() => {
    const newValue = !state.preferences.autoRefresh;
    dispatch({ type: ACTIONS.SET_PREFERENCE, payload: { key: 'autoRefresh', value: newValue } });
  }, [state.preferences.autoRefresh]);

  const actions = useMemo(() => ({
    setTheme,
    setLanguage,
    setPreference,
    showToast,
    hideToast,
    setLoading,
    setError,
    clearError,
    toggleTheme,
    toggleCompactMode,
    toggleAutoRefresh
  }), [
    setTheme,
    setLanguage,
    setPreference,
    showToast,
    hideToast,
    setLoading,
    setError,
    clearError,
    toggleTheme,
    toggleCompactMode,
    toggleAutoRefresh
  ]);

  // Wallet actions
  const setWallet = (wallet) => dispatch({ type: ACTIONS.SET_WALLET, payload: wallet });
  const clearWallet = () => dispatch({ type: ACTIONS.CLEAR_WALLET });
  const login = (privKey) => {
    const address = deriveAddress(privKey);
    setWallet({ privateKey: privKey, address });
  };
  const logout = () => clearWallet();

  const value = { state, ...actions, setWallet, clearWallet, login, logout };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to use app context
 */
export function useAppContext() {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useAppContext must be used within AppContextProvider');
  }
  
  return context;
}

/**
 * Hook for theme
 */
export function useTheme() {
  const { state, setTheme, toggleTheme } = useAppContext();
  return { theme: state.theme, setTheme, toggleTheme };
}

/**
 * Hook for language
 */
export function useLanguage() {
  const { state, setLanguage } = useAppContext();
  return { language: state.language, setLanguage };
}

/**
 * Hook for preferences
 */
export function usePreferences() {
  const { state, setPreference } = useAppContext();
  return { preferences: state.preferences, setPreference };
}

/**
 * Hook for notifications
 */
export function useNotification() {
  const { state, showToast, hideToast } = useAppContext();
  
  return {
    toast: state.toast,
    showToast,
    hideToast,
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    warning: (message, duration) => showToast(message, 'warning', duration)
  };
}

/**
 * Hook for loading state
 */
export function useLoadingState() {
  const { state, setLoading } = useAppContext();
  return { isLoading: state.isLoading, setLoading };
}

/**
 * Hook for error state
 */
export function useErrorState() {
  const { state, setError, clearError } = useAppContext();
  return { error: state.error, setError, clearError };
}

/**
 * Hook for online status
 */
export function useOnlineStatus() {
  const { state } = useAppContext();
  return state.isOnline;
}

/**
 * Hook for wallet management
 */
export function useWallet() {
  const { state, login, logout } = useAppContext();
  return { wallet: state.wallet, login, logout };
}
