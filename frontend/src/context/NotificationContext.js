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
  const [serviceWorkerReady, setServiceWorkerReady] = useState(false);

  // Auto-initialize notifications on component mount
  useEffect(() => {
    initializeAutoNotifications();
    registerServiceWorker();
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('✅ Service Worker registered:', registration);
        
        // Wait for service worker to be ready
        if (registration.installing) {
          registration.installing.addEventListener('statechange', (event) => {
            if (event.target.state === 'activated') {
              setServiceWorkerReady(true);
              console.log('✅ Service Worker activated and ready');
            }
          });
        } else if (registration.active) {
          setServiceWorkerReady(true);
          console.log('✅ Service Worker already active');
        }
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    }
  };

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
          resolve({
            latitude: 2.9516,
            longitude: 101.8430
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 600000
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

    // TEST: Send immediate test notifications for PWA
    console.log('🧪 Scheduling test notifications for PWA...');
    
    // Test notification in 5 seconds
    setTimeout(() => {
      sendPrayerNotification('Fajr Test');
      console.log('🧪 Test Fajr notification sent');
    }, 5000);

    // Test notification in 15 seconds  
    setTimeout(() => {
      sendPrayerNotification('Dhuhr Test');
      console.log('🧪 Test Dhuhr notification sent');
    }, 15000);

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
        
        if (timeUntilPrayer > 0 && timeUntilPrayer < 24 * 60 * 60 * 1000) {
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
      tag: `prayer-${prayerName}-${Date.now()}`,
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
      // Use service worker for PWA, fallback to browser notifications
      if ('serviceWorker' in navigator && serviceWorkerReady) {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(`${prayerName} Prayer Time`, options)
            .then(() => console.log(`📢 PWA Notification sent: ${prayerName}`))
            .catch(error => {
              console.error('PWA Notification failed, falling back to browser:', error);
              // Fallback to browser notifications
              new Notification(`${prayerName} Prayer Time`, options);
            });
        });
      } else {
        // Fallback to browser notifications
        const notification = new Notification(`${prayerName} Prayer Time`, options);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
        console.log(`📢 Browser Notification sent: ${prayerName}`);
      }
      
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
    serviceWorkerReady,
    refreshNotifications,
    enableAutoNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};