import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { fetchApi } from '../apiUtils';
import { API_BASE_PATH } from '../config';
import './NetworkStatus.css';

/**
 * Network status component showing real-time health metrics
 * Displays backend connectivity, response time, and status
 */
function NetworkStatus({ refreshInterval = 15000 }) {
  const { t } = useTranslation();
  const [status, setStatus] = useState({
    isOnline: true,
    latency: 0,
    lastCheck: null,
    errorCount: 0
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      const startTime = performance.now();
      
      try {
        await fetchApi(`${API_BASE_PATH}/health`);
        const endTime = performance.now();
        const latency = Math.round(endTime - startTime);
        
        setStatus({
          isOnline: true,
          latency,
          lastCheck: new Date(),
          errorCount: 0
        });
      } catch (error) {
        setStatus(prev => ({
          isOnline: false,
          latency: 0,
          lastCheck: new Date(),
          errorCount: prev.errorCount + 1
        }));
      }
    };

    // Initial check
    checkHealth();

    // Periodic checks
    const interval = setInterval(checkHealth, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = () => {
    if (!status.isOnline) return 'offline';
    if (status.latency > 1000) return 'slow';
    if (status.latency > 500) return 'medium';
    return 'fast';
  };

  const getStatusText = () => {
    if (!status.isOnline) return t('Offline');
    if (status.latency > 1000) return t('Slow');
    if (status.latency > 500) return t('Normal');
    return t('Fast');
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'offline') return '🔴';
    if (color === 'slow') return '🟠';
    if (color === 'medium') return '🟡';
    return '🟢';
  };

  return (
    <div 
      className={`network-status ${getStatusColor()}`}
      onClick={() => setIsExpanded(!isExpanded)}
      title={t('Click for network details')}
    >
      <div className="network-status-indicator">
        <span className="status-icon">{getStatusIcon()}</span>
        <span className="status-text">{getStatusText()}</span>
      </div>

      {isExpanded && (
        <div className="network-status-details">
          <div className="status-detail-row">
            <span className="detail-label">{t('Status')}:</span>
            <span className="detail-value">
              {status.isOnline ? t('Online') : t('Offline')}
            </span>
          </div>
          
          {status.isOnline && (
            <>
              <div className="status-detail-row">
                <span className="detail-label">{t('Latency')}:</span>
                <span className="detail-value">{status.latency}ms</span>
              </div>
              
              <div className="status-detail-row">
                <span className="detail-label">{t('Last Check')}:</span>
                <span className="detail-value">
                  {status.lastCheck?.toLocaleTimeString()}
                </span>
              </div>
            </>
          )}
          
          {status.errorCount > 0 && (
            <div className="status-detail-row">
              <span className="detail-label">{t('Failed Checks')}:</span>
              <span className="detail-value error">{status.errorCount}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

NetworkStatus.propTypes = {
  refreshInterval: PropTypes.number
};

export default NetworkStatus;
