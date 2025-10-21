import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

const CompassContext = createContext();

export const useCompass = () => {
  const context = useContext(CompassContext);
  if (!context) {
    throw new Error('useCompass must be used within a CompassProvider');
  }
  return context;
};

export const CompassProvider = ({ children }) => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [compassActive, setCompassActive] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [compassPermissionGranted, setCompassPermissionGranted] = useState(false);
  const [compassError, setCompassError] = useState('');
  const compassListenerRef = useRef(null);
  const lastHeadingRef = useRef(0);
  const eventCountRef = useRef(0);

  // Check compass permission status on load
  useEffect(() => {
    checkCompassPermissionStatus();
    console.log('🌍 CompassProvider initialized');
  }, []);

  const checkCompassPermissionStatus = () => {
    const savedPermission = localStorage.getItem('compassPermission');
    if (savedPermission === 'granted') {
      setCompassPermissionGranted(true);
      console.log('✅ Compass permission found in localStorage');
    }
  };

  const calculateQiblaDirection = (lat, lng) => {
    const φ1 = lat * Math.PI / 180;
    const φ2 = 21.4225 * Math.PI / 180;
    const λ1 = lng * Math.PI / 180;
    const λ2 = 39.8262 * Math.PI / 180;

    const y = Math.sin(λ2 - λ1);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(λ2 - λ1);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing);
  };

  const handleCompass = (event) => {
    eventCountRef.current++;
    
    let heading = null;

    // For iOS Safari
    if (typeof event.webkitCompassHeading !== 'undefined') {
      heading = event.webkitCompassHeading;
      console.log(`📱 iOS Compass Heading: ${heading}° (Event #${eventCountRef.current})`);
    }
    // For Android and other browsers
    else if (event.alpha !== null) {
      // Convert device orientation to compass heading
      heading = (360 - event.alpha) % 360;
      console.log(`🤖 Device Orientation - Alpha: ${event.alpha}°, Converted Heading: ${heading}° (Event #${eventCountRef.current})`);
    }

    if (heading !== null && !isNaN(heading)) {
      // Smooth the heading changes
      const smoothing = 0.3;
      const currentHeading = lastHeadingRef.current;
      let smoothedHeading;
      
      // Handle the 0-360 wrap-around for smoothing
      if (Math.abs(heading - currentHeading) > 180) {
        if (heading > currentHeading) {
          smoothedHeading = (currentHeading * (1 - smoothing) + (heading - 360) * smoothing + 360) % 360;
        } else {
          smoothedHeading = (currentHeading * (1 - smoothing) + (heading + 360) * smoothing) % 360;
        }
      } else {
        smoothedHeading = currentHeading * (1 - smoothing) + heading * smoothing;
      }
      
      setDeviceHeading(smoothedHeading);
      lastHeadingRef.current = smoothedHeading;
    } else {
      console.warn('⚠️ No valid compass data received:', {
        alpha: event.alpha,
        webkitCompassHeading: event.webkitCompassHeading,
        beta: event.beta,
        gamma: event.gamma
      });
    }
  };

  const setupCompass = () => {
    if (!window.DeviceOrientationEvent) {
      console.error('❌ DeviceOrientationEvent not supported');
      setCompassError('Compass not supported on this device');
      return;
    }

    console.log('🔄 Setting up compass...');

    // Remove any existing listener first
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current, true);
      console.log('🗑️ Removed previous compass listener');
    }

    // Reset counters
    eventCountRef.current = 0;
    lastHeadingRef.current = 0;

    // Set up new listener
    compassListenerRef.current = handleCompass;
    
    try {
      // Use capture phase and make it non-passive to ensure we get events
      window.addEventListener('deviceorientation', handleCompass, {
        capture: true,
        passive: false
      });
      
      setCompassActive(true);
      setCompassError('');
      console.log('🎯 Compass event listener added successfully');
      
      // Set up a test to check if events are coming through
      const testTimeout = setTimeout(() => {
        if (eventCountRef.current === 0) {
          console.warn('⚠️ No compass events received in 2 seconds - checking permissions...');
          checkCompassEvents();
        } else {
          console.log(`✅ Compass working - received ${eventCountRef.current} events`);
        }
      }, 2000);

      return () => clearTimeout(testTimeout);
      
    } catch (error) {
      console.error('❌ Failed to add compass event listener:', error);
      setCompassError('Failed to start compass sensor: ' + error.message);
    }
  };

  const checkCompassEvents = () => {
    console.log('🔍 Checking compass event status:', {
      hasListener: !!compassListenerRef.current,
      eventCount: eventCountRef.current,
      deviceHeading,
      compassActive
    });
  };

  const stopCompass = () => {
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current, true);
      compassListenerRef.current = null;
      console.log('⏹️ Compass stopped - event listener removed');
    }
    setCompassActive(false);
    setDeviceHeading(0);
    lastHeadingRef.current = 0;
    eventCountRef.current = 0;
  };

  const autoEnableCompass = async () => {
    if (compassActive) {
      console.log('ℹ️ Compass already active');
      return;
    }

    if (!window.DeviceOrientationEvent) {
      console.error('❌ Device orientation not supported');
      setCompassError('Compass not supported on this device');
      return;
    }

    console.log('🔄 Attempting to auto-enable compass...');

    try {
      // Check if we already have permission
      const savedPermission = localStorage.getItem('compassPermission');
      
      if (savedPermission === 'granted') {
        console.log('✅ Already have compass permission - enabling compass');
        setupCompass();
        return;
      }

      // For iOS devices that require permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('📱 iOS device detected - requesting compass permission...');
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            console.log('✅ iOS compass permission granted');
            localStorage.setItem('compassPermission', 'granted');
            setCompassPermissionGranted(true);
            setupCompass();
          } else {
            console.log('❌ iOS compass permission denied');
            localStorage.setItem('compassPermission', 'denied');
            setCompassError('Compass permission denied. Please enable in settings.');
          }
        } catch (err) {
          console.error('❌ iOS permission request failed:', err);
          setCompassError('Failed to request compass permission');
        }
      } else {
        // For Android and desktop - no permission needed, just enable
        console.log('🤖 Android/Desktop - auto-enabling compass');
        localStorage.setItem('compassPermission', 'granted');
        setCompassPermissionGranted(true);
        setupCompass();
      }
    } catch (error) {
      console.error('⚠️ Auto-enable compass failed:', error);
      setCompassError('Failed to enable compass automatically');
    }
  };

  const setUserLocationAndCalculateQibla = (latitude, longitude) => {
    setUserLocation({ latitude, longitude });
    const direction = calculateQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    console.log(`📍 Qibla direction calculated: ${direction}°`);
    
    // Auto-enable compass when location is set
    autoEnableCompass();
  };

  const getQiblaAngle = () => {
    if (!qiblaDirection || !compassActive) {
      return qiblaDirection || 0;
    }
    
    // Calculate the relative direction from current heading to Qibla
    const relativeDirection = (qiblaDirection - deviceHeading + 360) % 360;
    
    return relativeDirection;
  };

  // Debug function to check compass status
  const debugCompass = () => {
    console.log('🔍 COMPASS DEBUG:', {
      qiblaDirection,
      deviceHeading,
      compassActive,
      compassPermissionGranted,
      userLocation,
      eventCount: eventCountRef.current,
      lastHeading: lastHeadingRef.current,
      hasListener: !!compassListenerRef.current,
      relativeAngle: getQiblaAngle()
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (compassListenerRef.current) {
        window.removeEventListener('deviceorientation', compassListenerRef.current, true);
      }
    };
  }, []);

  const value = {
    qiblaDirection,
    deviceHeading,
    compassActive,
    userLocation,
    compassPermissionGranted,
    compassError,
    setUserLocationAndCalculateQibla,
    autoEnableCompass,
    stopCompass,
    setupCompass,
    getQiblaAngle,
    setCompassError,
    debugCompass // Add debug function to context
  };

  return (
    <CompassContext.Provider value={value}>
      {children}
    </CompassContext.Provider>
  );
};