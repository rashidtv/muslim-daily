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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

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
    }
  };

  const saveNotificationSettings = (enabled) => {
    const settings = {
      enabled,
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
    return result === 'granted';
  };

  const enableNotifications = async (prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']) => {
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          throw new Error('Notification permission not granted');
        }
      }

      setNotificationsEnabled(true);
      saveNotificationSettings(true);

      // Save prayer preferences
      const settings = JSON.parse(localStorage.getItem('muslimDiary_notifications') || '{}');
      settings.prayers = prayers;
      localStorage.setItem('muslimDiary_notifications', JSON.stringify(settings));

      console.log('✅ Notifications enabled for prayers:', prayers);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to enable notifications:', error);
      return { success: false, error: error.message };
    }
  };

  const disableNotifications = async () => {
    setNotificationsEnabled(false);
    saveNotificationSettings(false);
    console.log('✅ Notifications disabled');
    return { success: true };
  };

  const sendTestNotification = (prayerName = 'Test Prayer', prayerTime = 'Now') => {
    if (permission !== 'granted') {
      console.warn('Cannot send test notification - permission not granted');
      return;
    }

    const title = `🕌 ${prayerName} Prayer Time`;
    const body = `It's time for ${prayerName} prayer at ${prayerTime}`;

    // Send via service worker if available
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SEND_NOTIFICATION',
        notification: {
          title,
          body,
          tag: 'test-notification'
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

  const value = {
    permission,
    notificationsEnabled,
    requestPermission,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
    checkPermission
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};