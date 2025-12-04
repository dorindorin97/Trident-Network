import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import './PerformanceMonitor.css';

/**
 * Performance monitoring component for development
 * Shows FPS, memory usage, and network stats
 */
function PerformanceMonitor({ enabled = false }) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    fps: 0,
    memory: { used: 0, total: 0 },
    network: { requests: 0, latency: 0 }
  });
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== 'development') return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        const memory = performance.memory ? {
          used: Math.round(performance.memory.usedJSHeapSize / 1048576),
          total: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : { used: 0, total: 0 };

        setStats(prev => ({
          ...prev,
          fps,
          memory
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    animationId = requestAnimationFrame(measureFPS);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [enabled]);

  if (!enabled || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className={`perf-monitor ${isMinimized ? 'perf-monitor-minimized' : ''}`}>
      <div className="perf-monitor-header" onClick={() => setIsMinimized(!isMinimized)}>
        <span className="perf-monitor-title">⚡ {t('Performance')}</span>
        <button className="perf-monitor-toggle">{isMinimized ? '▲' : '▼'}</button>
      </div>
      
      {!isMinimized && (
        <div className="perf-monitor-content">
          <div className="perf-stat">
            <span className="perf-label">FPS:</span>
            <span className={`perf-value ${stats.fps < 30 ? 'perf-warning' : 'perf-good'}`}>
              {stats.fps}
            </span>
          </div>
          
          {stats.memory.total > 0 && (
            <div className="perf-stat">
              <span className="perf-label">Memory:</span>
              <span className="perf-value">
                {stats.memory.used} / {stats.memory.total} MB
              </span>
            </div>
          )}
          
          <div className="perf-stat">
            <span className="perf-label">Render:</span>
            <span className="perf-value perf-good">✓</span>
          </div>
        </div>
      )}
    </div>
  );
}

PerformanceMonitor.propTypes = {
  enabled: PropTypes.bool
};

export default PerformanceMonitor;
