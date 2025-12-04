import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { useClickOutside } from '../hooks/useCommon';
import './SettingsPanel.css';

/**
 * Settings panel for user preferences
 * Manages theme, language, refresh intervals, and display options
 */
function SettingsPanel({ isOpen, onClose, theme, setTheme, language, setLanguage }) {
  const { t, i18n } = useTranslation();
  const [localSettings, setLocalSettings] = useState({
    autoRefresh: localStorage.getItem('autoRefresh') !== 'false',
    refreshInterval: parseInt(localStorage.getItem('refreshInterval')) || 5000,
    showPerformance: localStorage.getItem('showPerformance') === 'true',
    compactMode: localStorage.getItem('compactMode') === 'true',
    animations: localStorage.getItem('animations') !== 'false'
  });

  const panelRef = useClickOutside(onClose);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    localStorage.setItem(key, value.toString());
    
    // Trigger reload for certain settings
    if (key === 'compactMode' || key === 'animations') {
      document.documentElement.classList.toggle('compact-mode', newSettings.compactMode);
      document.documentElement.classList.toggle('no-animations', !newSettings.animations);
    }
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleResetSettings = () => {
    if (window.confirm(t('Reset all settings to defaults?'))) {
      localStorage.clear();
      setLocalSettings({
        autoRefresh: true,
        refreshInterval: 5000,
        showPerformance: false,
        compactMode: false,
        animations: true
      });
      setTheme('dark');
      setLanguage('en');
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel" ref={panelRef}>
        <div className="settings-header">
          <h2>{t('Settings')}</h2>
          <button className="settings-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="settings-content">
          {/* Appearance Section */}
          <div className="settings-section">
            <h3>{t('Appearance')}</h3>
            
            <div className="setting-item">
              <label>{t('Theme')}</label>
              <div className="setting-control">
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 {t('Dark')}
                </button>
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ {t('Light')}
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>{t('Language')}</label>
              <select value={language} onChange={(e) => handleLanguageChange(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt">Português</option>
              </select>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.compactMode}
                  onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                />
                {t('Compact Mode')}
              </label>
              <span className="setting-description">
                {t('Reduces spacing for more content')}
              </span>
            </div>

            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.animations}
                  onChange={(e) => handleSettingChange('animations', e.target.checked)}
                />
                {t('Enable Animations')}
              </label>
              <span className="setting-description">
                {t('Disable for better performance')}
              </span>
            </div>
          </div>

          {/* Data Section */}
          <div className="settings-section">
            <h3>{t('Data & Updates')}</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.autoRefresh}
                  onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                />
                {t('Auto-refresh Data')}
              </label>
            </div>

            {localSettings.autoRefresh && (
              <div className="setting-item">
                <label>{t('Refresh Interval')}</label>
                <select
                  value={localSettings.refreshInterval}
                  onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                >
                  <option value="3000">3 {t('seconds')}</option>
                  <option value="5000">5 {t('seconds')}</option>
                  <option value="10000">10 {t('seconds')}</option>
                  <option value="30000">30 {t('seconds')}</option>
                  <option value="60000">1 {t('minute')}</option>
                </select>
              </div>
            )}
          </div>

          {/* Developer Section */}
          <div className="settings-section">
            <h3>{t('Developer')}</h3>
            
            <div className="setting-item">
              <label>
                <input
                  type="checkbox"
                  checked={localSettings.showPerformance}
                  onChange={(e) => handleSettingChange('showPerformance', e.target.checked)}
                />
                {t('Show Performance Monitor')}
              </label>
              <span className="setting-description">
                {t('Development only - requires page reload')}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="settings-actions">
            <button className="btn-danger" onClick={handleResetSettings}>
              {t('Reset to Defaults')}
            </button>
            <button className="btn-primary" onClick={onClose}>
              {t('Done')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

SettingsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  theme: PropTypes.string.isRequired,
  setTheme: PropTypes.func.isRequired,
  language: PropTypes.string.isRequired,
  setLanguage: PropTypes.func.isRequired
};

export default SettingsPanel;
