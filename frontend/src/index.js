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

// Service Worker with Mobile PWA update detection
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ SW registered');
        
        // Check for updates
        registration.update();

        // Listen for new service worker (MOBILE PWA only)
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Check if we're in a Mobile PWA
              const isMobilePWA = 
                (window.matchMedia('(display-mode: standalone)').matches || 
                 window.navigator.standalone) &&
                /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobilePWA) {
                console.log('📱 Mobile PWA update available - showing notification');
                if (window.showPWAUpdateNotification) {
                  window.showPWAUpdateNotification();
                }
              } else {
                console.log('💻 Desktop browser - no notification needed');
              }
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ SW registration failed:', error);
      });
  });
}

reportWebVitals();