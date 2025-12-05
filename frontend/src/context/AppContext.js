import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';

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
  
  // Network status
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true
};

// Action types
const ACTIONS = {
  SET_THEME: 'SET_THEME',
  SET_LANGUAGE: 'SET_LANGUAGE',
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
  const actions = useMemo(() => ({
    setTheme: (theme) => dispatch({ type: ACTIONS.SET_THEME, payload: theme }),
    setLanguage: (language) => dispatch({ type: ACTIONS.SET_LANGUAGE, payload: language }),
    setPreference: useCallback((key, value) => {
      dispatch({ type: ACTIONS.SET_PREFERENCE, payload: { key, value } });
    }, []),
    showToast: (message, type = 'info', duration = 3000) => {
      dispatch({ 
        type: ACTIONS.SHOW_TOAST, 
        payload: { message, type, duration, id: Date.now() } 
      });
    },
    hideToast: () => dispatch({ type: ACTIONS.HIDE_TOAST }),
    setLoading: (isLoading) => dispatch({ type: ACTIONS.SET_LOADING, payload: isLoading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    clearError: () => dispatch({ type: ACTIONS.CLEAR_ERROR }),
    toggleTheme: () => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      dispatch({ type: ACTIONS.SET_THEME, payload: newTheme });
    },
    toggleCompactMode: () => {
      const newValue = !state.preferences.compactMode;
      dispatch({ 
        type: ACTIONS.SET_PREFERENCE, 
        payload: { key: 'compactMode', value: newValue } 
      });
    },
    toggleAutoRefresh: () => {
      const newValue = !state.preferences.autoRefresh;
      dispatch({ 
        type: ACTIONS.SET_PREFERENCE, 
        payload: { key: 'autoRefresh', value: newValue } 
      });
    }
  }), [state.theme, state.preferences.compactMode, state.preferences.autoRefresh]);

  const value = { state, ...actions };

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
