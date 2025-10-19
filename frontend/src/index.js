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

// SIMPLE PWA Update - Mobile Only
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered');
        
        // Check for updates every 2 minutes
        setInterval(() => {
          registration.update();
        }, 2 * 60 * 1000);

        // Listen for controller change (when update is ready)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('New version activated - reloading');
          window.location.reload();
        });

        // Check if update is already waiting
        if (registration.waiting) {
          console.log('Update waiting - reloading');
          window.location.reload();
        }

      })
      .catch(console.error);
  });
}

reportWebVitals();