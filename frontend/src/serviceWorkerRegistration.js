// Service Worker Registration Utility
// Handles service worker installation and updates
import { captureMessage, captureException } from './utils/errorTracker';

export function register() {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          captureMessage('Service Worker registered', 'info', { registration });

          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute

          // Handle updates
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                  // New update available
                  captureMessage('New content available; please refresh.', 'info');
                  
                  // Show update notification
                  if (window.showToast) {
                    window.showToast(
                      'New version available! Click to update.',
                      'info',
                      () => {
                        installingWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      }
                    );
                  }
                } else {
                  // Content cached for offline use
                  captureMessage('Content cached for offline use.', 'info');
                }
              }
            };
          };
        })
        .catch((error) => {
          try {
            captureException(error, { source: 'serviceWorkerRegistration' });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Failed to capture service worker registration error:', e);
          }
        });

      // Handle controller change
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        try {
          captureException(error, { source: 'serviceWorkerUnregister' });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error('Failed to capture service worker unregistration error:', e);
        }
      });
  }
}

// Clear all caches
export function clearCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
  }
}

// Get service worker version
export async function getVersion() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.version);
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }
  return null;
}

// Check if online
export function isOnline() {
  return navigator.onLine;
}

// Add online/offline event listeners
export function addConnectivityListeners(onOnline, onOffline) {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
