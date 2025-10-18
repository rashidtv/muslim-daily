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

// Service Worker Registration with Auto-Updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // Use a cache-busting URL to force update detection
      const registration = await navigator.serviceWorker.register('/sw.js?v=' + Date.now());
      
      console.log('✅ SW registered: ', registration);

      // Check for updates immediately and every 30 minutes
      registration.update();
      setInterval(() => registration.update(), 30 * 60 * 1000);

      // Listen for new service worker installation
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 New SW update found!');

        newWorker.addEventListener('statechange', () => {
          console.log('🔄 SW state:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available - show update notification
            console.log('✅ New version available!');
            showUpdateNotification();
          }
        });
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
          showUpdateNotification();
        }
      });

    } catch (error) {
      console.log('❌ SW registration failed: ', error);
    }
  });

  // Auto-reload when new service worker takes control
  let isRefreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!isRefreshing) {
      console.log('🔄 New SW activated, reloading...');
      isRefreshing = true;
      window.location.reload();
    }
  });
}

// Show update notification to user
function showUpdateNotification() {
  // Check if we're in a PWA
  const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                window.navigator.standalone ||
                document.referrer.includes('android-app://');

  if (isPWA) {
    // For PWA - show a subtle notification that auto-updates
    if (window.showPWAUpdateNotification) {
      window.showPWAUpdateNotification();
    } else {
      // Fallback: auto-update after short delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  } else {
    // For browser - show interactive notification
    if (confirm('🎉 New version available! Reload to get the latest features?')) {
      window.location.reload();
    }
  }
}

// Make update function available globally for App.js to use
window.checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
    });
  }
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();