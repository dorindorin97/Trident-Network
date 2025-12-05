import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './WebSocketStatus.css';

/**
 * WebSocket connection status indicator
 * Shows real-time connection state with visual feedback
 */
function WebSocketStatus({ wsManager }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState('disconnected');
  const [clientCount, setClientCount] = useState(0);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    if (!wsManager) return;

    // Poll for status updates
    const checkStatus = () => {
      try {
        const stats = wsManager.getStats();
        setClientCount(stats.totalClients || 0);
        setReconnectAttempts(stats.reconnectAttempts || 0);
        setStatus('connected');
      } catch (error) {
        setStatus('disconnected');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 2000);

    return () => clearInterval(interval);
  }, [wsManager]);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return '🟢';
      case 'connecting':
        return '🟡';
      case 'disconnected':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return t('Connected');
      case 'connecting':
        return t('Connecting...');
      case 'disconnected':
        return t('Disconnected');
      default:
        return t('Unknown');
    }
  };

  return (
    <div className={`ws-status ws-status-${status}`} title={`WebSocket: ${getStatusText()}`}>
      <span className="ws-status-icon">{getStatusIcon()}</span>
      <span className="ws-status-text">{getStatusText()}</span>
      {status === 'connected' && clientCount > 0 && (
        <span className="ws-status-count">({clientCount})</span>
      )}
      {status === 'connecting' && reconnectAttempts > 0 && (
        <span className="ws-status-attempts">Attempt {reconnectAttempts}</span>
      )}
    </div>
  );
}

WebSocketStatus.propTypes = {
  wsManager: PropTypes.object
};

export default WebSocketStatus;
