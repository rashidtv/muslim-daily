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

// Service Worker Registration with forced updates
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Add cache-busting parameter to force update
    navigator.serviceWorker.register('/sw.js?v=1.6')
      .then((registration) => {
        console.log('✅ SW registered: ', registration);
        
        // Force immediate update check
        registration.update();
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hour
        
        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New SW found, updating...');
          
          newWorker.addEventListener('statechange', () => {
            console.log('🔄 SW state changed:', newWorker.state);
            
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // New content available
                console.log('✅ New content available, please refresh!');
                
                // Show update notification to user
                if (window.confirm('A new version of Muslim Diary is available! Reload to get the latest features?')) {
                  window.location.reload();
                }
              } else {
                // First installation
                console.log('✅ Content is cached for offline use.');
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log('❌ SW registration failed: ', registrationError);
      });
  });

  // Handle controller changes (when a new service worker takes control)
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      console.log('🔄 Controller changed, reloading page...');
      refreshing = true;
      window.location.reload();
    }
  });
}

// Optional: Add a manual update check function
window.checkForUpdates = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.update();
      console.log('🔄 Manual update check triggered');
    });
  }
};

// Optional: Add a function to unregister service worker (for development)
window.unregisterSW = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister().then(() => {
        console.log('🗑️ Service Worker unregistered');
        window.location.reload();
      });
    });
  }
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();