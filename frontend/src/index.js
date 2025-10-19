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

// PROPER PWA Update Handling
if ('serviceWorker' in navigator) {
  let refreshing = false;
  
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      window.location.reload();
    }
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered');
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('Update found');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available - show notification WITHOUT closing app
              if (window.showUpdateNotification) {
                window.showUpdateNotification(registration.waiting);
              }
            }
          });
        });
      })
      .catch(console.error);
  });

  // Global function to show update notification
  window.showUpdateNotification = (waitingWorker) => {
    // Create a custom event to trigger the update notification in App.js
    const event = new CustomEvent('pwaUpdateAvailable', { 
      detail: { waitingWorker } 
    });
    window.dispatchEvent(event);
  };

  // Global function to skip waiting and update
  window.skipWaitingAndUpdate = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };
}

reportWebVitals();