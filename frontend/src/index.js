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

// Enhanced PWA Update Detection - Mobile Only with instant notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=2.3.0')
      .then((registration) => {
        console.log('✅ SW registered');

        // Check if this is a mobile device
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
          console.log('🖥️ Desktop device - skipping update notifications');
          return;
        }

        console.log('📱 Mobile device - enabling update notifications');

        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

        // Track the waiting service worker
        let newServiceWorker = null;

        // Listen for the controlling service worker changing
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 Controller changed - reloading page');
          window.location.reload();
        });

        // Listen for updates found
        registration.addEventListener('updatefound', () => {
          console.log('🔄 Update found');
          newServiceWorker = registration.installing;
          
          newServiceWorker.addEventListener('statechange', () => {
            if (newServiceWorker.state === 'installed') {
              console.log('✅ New version installed, notifying app');
              if (window.showPWAUpdateNotification) {
                window.showPWAUpdateNotification(registration);
              }
            }
          });
        });

        // Check if there's already a waiting service worker
        if (registration.waiting) {
          console.log('📱 Update already waiting');
          if (window.showPWAUpdateNotification) {
            window.showPWAUpdateNotification(registration);
          }
        }

      })
      .catch((error) => {
        console.log('❌ SW registration failed:', error);
      });
  });

  // Listen for messages to skip waiting
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      navigator.serviceWorker.ready.then(registration => {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  });
}

// Global function for manual update checks
window.checkForPWAUpdate = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

reportWebVitals();