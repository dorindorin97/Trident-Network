import React from 'react';
import PropTypes from 'prop-types';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // Could send to error reporting service here
    // e.g., Sentry, LogRocket, etc.
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, retryCount } = this.state;
      const { fallback } = this.props;
      
      // Use custom fallback if provided
      if (fallback) {
        return fallback({ 
          error, 
          errorInfo, 
          retry: this.handleRetry,
          retryCount 
        });
      }

      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p className="error-message">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {retryCount > 0 && (
              <p className="retry-info">
                Retry attempts: {retryCount}
              </p>
            )}
            
            <div className="error-actions">
              <button onClick={this.handleRetry} className="btn-primary">
                🔄 Try Again
              </button>
              <button onClick={this.handleGoHome} className="btn-secondary ml-sm">
                🏠 Go Home
              </button>
              <button onClick={this.handleReload} className="btn-secondary ml-sm">
                ↻ Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && error && (
              <details className="error-details">
                <summary>Error details (development only)</summary>
                <div className="error-stack">
                  <strong>Error:</strong>
                  <pre>{error.toString()}</pre>
                  {errorInfo && (
                    <>
                      <strong>Component Stack:</strong>
                      <pre>{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func
};

export default ErrorBoundary;
