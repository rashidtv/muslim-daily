import React, { createContext, useState, useContext, useEffect } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [permission, setPermission] = useState('default');
  const [subscription, setSubscription] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Check notification permission on component mount
  useEffect(() => {
    checkPermission();
    loadNotificationSettings();
  }, []);

  const checkPermission = () => {
    if (!('Notification' in window)) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission);
  };

  const loadNotificationSettings = () => {
    const saved = localStorage.getItem('muslimDiary_notifications');
    if (saved) {
      const settings = JSON.parse(saved);
      setNotificationsEnabled(settings.enabled || false);
      setSubscription(settings.subscription || null);
    }
  };

  const saveNotificationSettings = (enabled, sub = null) => {
    const settings = {
      enabled,
      subscription: sub || subscription,
      enabledAt: new Date().toISOString()
    };
    localStorage.setItem('muslimDiary_notifications', JSON.stringify(settings));
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notification permission was previously denied. Please enable it in your browser settings.');
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      await registerServiceWorker();
      return true;
    }

    return false;
  };

  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service workers are not supported');
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered successfully');

      // Subscribe to push notifications
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || 'BIZ7u7qk8Xq6Y7p2eK9c1eK3eK7u7qk8Xq6Y7p2eK9c1eK3eK7u7qk8Xq6Y7p2eK9c1eK3eK7u7qk8')
      });

      setSubscription(sub);
      saveNotificationSettings(true, sub);
      setNotificationsEnabled(true);

      return sub;
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      throw error;
    }
  };

  const enableNotifications = async (prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) => {
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Notification permission not granted');
        }
      }

      const sub = await registerServiceWorker();
      
      // Save prayer preferences
      const settings = JSON.parse(localStorage.getItem('muslimDiary_notifications') || '{}');
      settings.prayers = prayers;
      localStorage.setItem('muslimDiary_notifications', JSON.stringify(settings));

      console.log('✅ Notifications enabled for prayers:', prayers);
      return { success: true, subscription: sub };

    } catch (error) {
      console.error('❌ Failed to enable notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const disableNotifications = async () => {
    try {
      if (subscription) {
        await subscription.unsubscribe();
      }

      setNotificationsEnabled(false);
      setSubscription(null);
      saveNotificationSettings(false);

      console.log('✅ Notifications disabled');
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to disable notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const sendTestNotification = (prayerName = 'Test Prayer', prayerTime = 'Now') => {
    if (permission !== 'granted') {
      console.warn('Cannot send test notification - permission not granted');
      return;
    }

    const title = `🕌 ${prayerName} Prayer Time`;
    const body = `It's time for ${prayerName} prayer at ${prayerTime}`;

    // Send via service worker for action buttons
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SEND_NOTIFICATION',
        notification: {
          title,
          body,
          tag: 'test-notification',
          data: { prayerName, prayerTime, test: true }
        }
      });
    } else {
      // Fallback to regular notification
      new Notification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        tag: 'prayer-notification'
      });
    }
  };

  const sendPrayerNotification = (prayerName, prayerTime) => {
    if (!notificationsEnabled || permission !== 'granted') {
      return;
    }

    const title = `🕌 ${prayerName} Prayer Time`;
    const body = `It's time for ${prayerName} prayer at ${prayerTime}\n\n"Establish prayer for My remembrance." (Quran 20:14)`;

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SEND_NOTIFICATION',
        notification: {
          title,
          body,
          tag: `prayer-${prayerName.toLowerCase()}`,
          data: { prayerName, prayerTime, timestamp: new Date().toISOString() }
        }
      });
    }
  };

  const value = {
    permission,
    subscription,
    notificationsEnabled,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    sendPrayerNotification,
    checkPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}