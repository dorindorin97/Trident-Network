import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchApi, getErrorMessage } from '../apiUtils';
import { API_BASE_PATH } from '../config';
import Spinner from './Spinner';
import './AdminDashboard.css';

function AdminDashboard() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheStats, setCacheStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [health, setHealth] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [cache, metricsData, healthData] = await Promise.all([
        fetchApi(`${API_BASE_PATH}/admin/cache/stats`),
        fetchApi(`${API_BASE_PATH}/admin/metrics`),
        fetchApi(`${API_BASE_PATH}/health`)
      ]);
      
      setCacheStats(cache);
      setMetrics(metricsData);
      setHealth(healthData);
      setLastRefresh(Date.now());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = async () => {
    if (!window.confirm('Are you sure you want to clear the cache?')) {
      return;
    }
    
    try {
      await fetchApi(`${API_BASE_PATH}/admin/cache`, { method: 'DELETE' });
      await fetchData();
      alert('Cache cleared successfully');
    } catch (err) {
      alert(`Failed to clear cache: ${getErrorMessage(err)}`);
    }
  };

  const formatUptime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading && !cacheStats) return <Spinner />;

  return (
    <div className="container admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{t('Admin Dashboard')}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={fetchData} className="btn-primary" disabled={loading}>
            🔄 {t('Refresh')}
          </button>
          <button onClick={handleClearCache} className="btn-primary" disabled={loading}>
            🗑️ {t('Clear Cache')}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="dashboard-grid">
        {/* System Health */}
        <div className="dashboard-card">
          <h3>{t('System Health')}</h3>
          {health && (
            <>
              <div className="stat-row">
                <span className="stat-label">{t('Status')}:</span>
                <span className={`status-badge ${health.status}`}>{health.status}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{t('Uptime')}:</span>
                <span>{formatUptime(Date.now() - metrics?.startTime || 0)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Environment:</span>
                <span>{health.environment}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Node:</span>
                <span className="node-url">{health.rpcUrl}</span>
              </div>
            </>
          )}
        </div>

        {/* Cache Statistics */}
        <div className="dashboard-card">
          <h3>{t('Cache Statistics')}</h3>
          {cacheStats && (
            <>
              <div className="stat-row">
                <span className="stat-label">{t('Cache Size')}:</span>
                <span>{cacheStats.size} items ({formatBytes(cacheStats.size * 500)})</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Hits:</span>
                <span className="stat-value-good">{cacheStats.hits}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Misses:</span>
                <span className="stat-value-warning">{cacheStats.misses}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{t('Hit Rate')}:</span>
                <span className={cacheStats.hitRate >= 50 ? 'stat-value-good' : 'stat-value-warning'}>
                  {cacheStats.hitRate}%
                </span>
              </div>
            </>
          )}
        </div>

        {/* Request Metrics */}
        <div className="dashboard-card">
          <h3>{t('Request Metrics')}</h3>
          {metrics && (
            <>
              <div className="stat-row">
                <span className="stat-label">{t('Total Requests')}:</span>
                <span>{metrics.totalRequests}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Avg per minute:</span>
                <span>
                  {((metrics.totalRequests / ((Date.now() - metrics.startTime) / 60000)) || 0).toFixed(2)}
                </span>
              </div>
              {metrics.requestsByEndpoint && (
                <div className="endpoint-stats">
                  <strong>Top Endpoints:</strong>
                  <ul>
                    {Object.entries(metrics.requestsByEndpoint)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([endpoint, count]) => (
                        <li key={endpoint}>
                          <code>{endpoint}</code>: {count}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* WebSocket Info */}
        <div className="dashboard-card">
          <h3>{t('WebSocket Clients')}</h3>
          <div className="stat-row">
            <span className="stat-label">{t('Connected Clients')}:</span>
            <span className="stat-value-good">0</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Subscriptions:</span>
            <span>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1rem' }}>
                <li>blocks: 0</li>
                <li>transactions: 0</li>
                <li>validators: 0</li>
              </ul>
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Last updated: {new Date(lastRefresh).toLocaleTimeString()}
      </div>
    </div>
  );
}

export default AdminDashboard;
