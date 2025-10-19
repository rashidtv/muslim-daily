import React, { createContext, useContext, useEffect, useState } from 'react';
import { calculatePrayerTimes, getCurrentLocation } from '../utils/prayerTimes';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auto-initialize notifications on component mount
  useEffect(() => {
    initializeAutoNotifications();
  }, []);

  const initializeAutoNotifications = async () => {
    setLoading(true);
    try {
      console.log('🔄 Initializing automatic prayer notifications...');
      
      // Get user location first
      const location = await getUserLocation();
      setUserLocation(location);
      console.log('📍 Location obtained:', location);

      if (location) {
        // Auto-enable notifications without asking user
        const enabled = await enableAutoNotifications(location);
        setNotificationsEnabled(enabled);
        
        if (enabled) {
          console.log('✅ Automatic prayer notifications enabled successfully');
        } else {
          console.log('❌ Automatic prayer notifications not enabled');
        }
      }
    } catch (error) {
      console.error('Error initializing auto notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.log('📍 Geolocation not supported, using default location');
        resolve({
          latitude: 2.9516, // Semenyih default
          longitude: 101.8430
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.log('📍 Location error, using default:', error);
          // Use default location if geolocation fails
          resolve({
            latitude: 2.9516, // Semenyih default
            longitude: 101.8430
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000 // 10 minutes
        }
      );
    });
  };

  const enableAutoNotifications = async (location) => {
    try {
      // Auto-request notification permission
      const permissionGranted = await requestNotificationPermission();
      
      if (permissionGranted && location) {
        // Calculate prayer times using your existing function
        const times = await calculatePrayerTimes(location.latitude, location.longitude);
        setPrayerTimes(times);

        // Schedule notifications for all prayer times
        await scheduleAllPrayerNotifications(times);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error enabling auto notifications:', error);
      return false;
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.warn('🔕 Notifications not supported');
      return false;
    }

    try {
      // Auto-request permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Notification permission granted automatically');
        
        // Register service worker for PWA notifications
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered for notifications');
          } catch (error) {
            console.log('ℹ️ Service Worker registration failed, using browser notifications');
          }
        }
        
        return true;
      } else {
        console.log('❌ Notification permission not granted automatically');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  const scheduleAllPrayerNotifications = async (prayerTimes) => {
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    let scheduledCount = 0;

    // TEST: Send immediate test notifications
    console.log('🧪 Scheduling test notifications...');
    
    // Test notification in 10 seconds
    setTimeout(() => {
      sendPrayerNotification('Fajr');
      console.log('🧪 Test Fajr notification sent');
    }, 10000);

    // Test notification in 20 seconds  
    setTimeout(() => {
      sendPrayerNotification('Dhuhr');
      console.log('🧪 Test Dhuhr notification sent');
    }, 20000);

    for (const prayer of prayers) {
      if (prayer.time) {
        const scheduled = await schedulePrayerTimeNotification(prayer.name, prayer.time);
        if (scheduled) scheduledCount++;
      }
    }

    console.log(`📅 Scheduled ${scheduledCount} real prayer notifications`);
    return scheduledCount > 0;
  };

  const schedulePrayerTimeNotification = async (prayerName, prayerTimeStr) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const now = new Date();
      const prayerTime = parseTimeString(prayerTimeStr);
      
      // If prayer time is in the future, schedule it
      if (prayerTime > now) {
        const timeUntilPrayer = prayerTime.getTime() - now.getTime();
        
        if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) { // Only schedule if within 24 hours
          setTimeout(() => {
            sendPrayerNotification(prayerName);
          }, timeUntilPrayer);
          
          console.log(`⏰ Scheduled ${prayerName} notification in ${Math.round(timeUntilPrayer/60000)} minutes`);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error scheduling ${prayerName} notification:`, error);
      return false;
    }
  };

  const parseTimeString = (timeStr) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  };

  const sendPrayerNotification = (prayerName) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }

    const options = {
      body: `It's time for ${prayerName} prayer. May your prayers be accepted. 🌙`,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: `prayer-${prayerName}`,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      actions: [
        {
          action: 'snooze',
          title: '⏰ Snooze 5 min'
        },
        {
          action: 'dismiss',
          title: '❌ Dismiss'
        }
      ]
    };

    try {
      // Try service worker notification first (for PWA)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(`${prayerName} Prayer Time`, options);
        });
      } else {
        // Fallback to browser notifications
        const notification = new Notification(`${prayerName} Prayer Time`, options);
        
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      }
      
      console.log(`📢 Prayer notification sent: ${prayerName}`);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  };

  const refreshNotifications = async () => {
    if (userLocation) {
      setLoading(true);
      try {
        const times = await calculatePrayerTimes(userLocation.latitude, userLocation.longitude);
        setPrayerTimes(times);
        
        if (notificationsEnabled) {
          await scheduleAllPrayerNotifications(times);
        }
      } catch (error) {
        console.error('Error refreshing notifications:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const value = {
    notificationsEnabled,
    prayerTimes,
    userLocation,
    loading,
    refreshNotifications,
    enableAutoNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};