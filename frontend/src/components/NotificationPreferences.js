import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './NotificationPreferences.css';

const NotificationPreferences = () => {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState(() => {
    const saved = localStorage.getItem('notificationPreferences');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      newBlocks: true,
      largeTransactions: true,
      validatorChanges: true,
      thresholdAmount: 10000,
      sound: true,
      desktop: true,
      email: ''
    };
  });

  const [permissionStatus, setPermissionStatus] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  }, [preferences]);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        new Notification('Notifications Enabled', {
          body: 'You will now receive blockchain updates',
          icon: '/logo192.png'
        });
      }
    } catch (error) {
      // Notification permission request failed
    }
  };

  const testNotification = () => {
    if (permissionStatus !== 'granted') {
      requestPermission();
      return;
    }

    new Notification('Test Notification', {
      body: 'This is how notifications will appear',
      icon: '/logo192.png',
      badge: '/badge.png'
    });

    if (preferences.sound) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Audio playback failed, user may have disabled audio
      });
    }
  };

  const updatePreference = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="notification-preferences">
      <div className="preferences-header">
        <h2>{t('notifications.title', 'Notification Preferences')}</h2>
        <p className="preferences-subtitle">
          {t('notifications.subtitle', 'Configure alerts for blockchain events')}
        </p>
      </div>

      <div className="preference-section">
        <div className="section-header">
          <h3>{t('notifications.general', 'General Settings')}</h3>
        </div>

        <div className="preference-item">
          <label className="preference-label">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => updatePreference('enabled', e.target.checked)}
            />
            <span className="label-text">
              {t('notifications.enable', 'Enable Notifications')}
            </span>
          </label>
          <p className="preference-description">
            {t('notifications.enableDesc', 'Receive alerts for selected blockchain events')}
          </p>
        </div>

        {preferences.enabled && (
          <>
            <div className="permission-banner">
              {permissionStatus === 'default' && (
                <div className="banner warning">
                  <span>⚠️ {t('notifications.permissionNeeded', 'Browser permission required')}</span>
                  <button onClick={requestPermission} className="btn-permission">
                    {t('notifications.grantPermission', 'Grant Permission')}
                  </button>
                </div>
              )}
              {permissionStatus === 'denied' && (
                <div className="banner error">
                  <span>🚫 {t('notifications.permissionDenied', 'Notifications blocked. Enable in browser settings.')}</span>
                </div>
              )}
              {permissionStatus === 'granted' && (
                <div className="banner success">
                  <span>✅ {t('notifications.permissionGranted', 'Notifications enabled')}</span>
                  <button onClick={testNotification} className="btn-test">
                    {t('notifications.test', 'Test')}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {preferences.enabled && (
        <>
          <div className="preference-section">
            <div className="section-header">
              <h3>{t('notifications.events', 'Event Types')}</h3>
            </div>

            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={preferences.newBlocks}
                  onChange={(e) => updatePreference('newBlocks', e.target.checked)}
                />
                <span className="label-text">
                  {t('notifications.newBlocks', 'New Blocks')}
                </span>
              </label>
              <p className="preference-description">
                {t('notifications.newBlocksDesc', 'Alert when a new block is mined (~every 2 seconds)')}
              </p>
            </div>

            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={preferences.largeTransactions}
                  onChange={(e) => updatePreference('largeTransactions', e.target.checked)}
                />
                <span className="label-text">
                  {t('notifications.largeTransactions', 'Large Transactions')}
                </span>
              </label>
              <p className="preference-description">
                {t('notifications.largeTransactionsDesc', 'Alert for transactions above threshold')}
              </p>
              {preferences.largeTransactions && (
                <div className="nested-preference">
                  <label>
                    {t('notifications.threshold', 'Threshold Amount')}:
                    <input
                      type="number"
                      value={preferences.thresholdAmount}
                      onChange={(e) => updatePreference('thresholdAmount', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1000"
                      className="input-number"
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={preferences.validatorChanges}
                  onChange={(e) => updatePreference('validatorChanges', e.target.checked)}
                />
                <span className="label-text">
                  {t('notifications.validatorChanges', 'Validator Changes')}
                </span>
              </label>
              <p className="preference-description">
                {t('notifications.validatorChangesDesc', 'Alert when validators join or leave the network')}
              </p>
            </div>
          </div>

          <div className="preference-section">
            <div className="section-header">
              <h3>{t('notifications.delivery', 'Delivery Options')}</h3>
            </div>

            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={preferences.desktop}
                  onChange={(e) => updatePreference('desktop', e.target.checked)}
                  disabled={permissionStatus !== 'granted'}
                />
                <span className="label-text">
                  {t('notifications.desktop', 'Desktop Notifications')}
                </span>
              </label>
              <p className="preference-description">
                {t('notifications.desktopDesc', 'Show notifications in your browser')}
              </p>
            </div>

            <div className="preference-item">
              <label className="preference-label">
                <input
                  type="checkbox"
                  checked={preferences.sound}
                  onChange={(e) => updatePreference('sound', e.target.checked)}
                />
                <span className="label-text">
                  {t('notifications.sound', 'Sound Alerts')}
                </span>
              </label>
              <p className="preference-description">
                {t('notifications.soundDesc', 'Play a sound when notifications arrive')}
              </p>
            </div>

            <div className="preference-item">
              <label className="preference-label-block">
                <span className="label-text">
                  {t('notifications.email', 'Email Notifications (Coming Soon)')}
                </span>
                <input
                  type="email"
                  value={preferences.email}
                  onChange={(e) => updatePreference('email', e.target.value)}
                  placeholder="your@email.com"
                  className="input-email"
                  disabled
                />
              </label>
              <p className="preference-description">
                {t('notifications.emailDesc', 'Receive important alerts via email')}
              </p>
            </div>
          </div>

          <div className="preferences-footer">
            <button onClick={testNotification} className="btn-test-large">
              {t('notifications.sendTest', 'Send Test Notification')}
            </button>
            <p className="footer-note">
              {t('notifications.note', 'Note: Notification frequency may be rate-limited to prevent spam.')}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPreferences;
