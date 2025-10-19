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

// PWA Update Detection - SIMPLE & RELIABLE
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js?v=3.0.0')
      .then((registration) => {
        console.log('SW registered');
        
        // Check for waiting service worker immediately
        if (registration.waiting) {
          console.log('Update waiting - showing notification');
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('showUpdateNotification'));
          }, 3000); // Show after 3 seconds (after location loads)
        }

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New update installed - showing notification');
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('showUpdateNotification'));
              }, 3000); // Show after 3 seconds
            }
          });
        });
      })
      .catch(console.error);
  });
}

reportWebVitals();