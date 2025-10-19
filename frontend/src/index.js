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

// Enhanced PWA Update Detection - Mobile Only
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=2.3.1')
      .then((registration) => {
        console.log('✅ SW registered');

        // Check if this is a mobile device before showing notifications
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (!isMobile) {
          console.log('🖥️ Desktop device - skipping update notifications');
          return;
        }

        console.log('📱 Mobile device - enabling update notifications');

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('🔄 New service worker activated on mobile');
          if (window.showPWAUpdateNotification) {
            window.showPWAUpdateNotification();
          }
        });

        // Check for waiting service worker
        if (registration.waiting) {
          console.log('📱 Update waiting on mobile - showing notification');
          if (window.showPWAUpdateNotification) {
            window.showPWAUpdateNotification();
          }
          return;
        }

        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New update found on mobile');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('✅ New version ready on mobile - showing notification');
              if (window.showPWAUpdateNotification) {
                window.showPWAUpdateNotification();
              }
            }
          });
        });

        // Check for updates periodically (every 6 hours)
        setInterval(() => {
          registration.update();
        }, 6 * 60 * 60 * 1000);

      })
      .catch((error) => {
        console.log('❌ SW registration failed:', error);
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE' && isMobile) {
      console.log('📢 Service worker sent mobile update notification');
      if (window.showPWAUpdateNotification) {
        window.showPWAUpdateNotification();
      }
    }
  });
}

// Global function for updates - mobile only
window.checkForUpdates = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if ('serviceWorker' in navigator && isMobile) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

reportWebVitals();