import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Working PWA Update Detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use version parameter to force update detection
    navigator.serviceWorker.register('/sw.js?v=2.3')
      .then((registration) => {
        console.log('✅ SW registered');

        // Force update check
        registration.update();

        // Listen for controller changes (when new SW takes over)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 New service worker activated');
          // Show update notification
          if (window.showPWAUpdateNotification) {
            window.showPWAUpdateNotification();
          }
        });

        // Check if there's a waiting service worker
        if (registration.waiting) {
          console.log('📱 Update already waiting - showing notification');
          if (window.showPWAUpdateNotification) {
            window.showPWAUpdateNotification();
          }
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New version ready - showing notification');
              // Show notification for all environments
              if (window.showPWAUpdateNotification) {
                window.showPWAUpdateNotification();
              }
            }
          });
        });

      })
      .catch((error) => {
        console.log('❌ SW registration failed:', error);
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
      console.log('📢 Service worker sent update notification');
      if (window.showPWAUpdateNotification) {
        window.showPWAUpdateNotification();
      }
    }
  });
}

// Global function for updates
window.checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

reportWebVitals();