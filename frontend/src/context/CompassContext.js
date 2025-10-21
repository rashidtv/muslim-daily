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
    if (event.alpha !== null) {
      let heading = event.alpha;
      
      console.log('🧭 Raw compass data:', {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
        webkitCompassHeading: event.webkitCompassHeading
      });

      // For iOS Safari - use webkitCompassHeading if available
      if (typeof event.webkitCompassHeading !== 'undefined' && event.webkitCompassHeading !== null) {
        heading = event.webkitCompassHeading;
        console.log('📱 Using iOS webkitCompassHeading:', heading);
      } else {
        // For Android and other browsers - convert alpha to compass heading
        // DeviceOrientation alpha is 0-360, but we need to convert to compass heading
        heading = (360 - event.alpha) % 360;
        console.log('🤖 Using standard alpha converted to heading:', heading);
      }
      
      if (heading !== null && !isNaN(heading)) {
        // Smooth the heading changes for better UX
        const smoothing = 0.2;
        const smoothedHeading = lastHeadingRef.current * (1 - smoothing) + heading * smoothing;
        
        setDeviceHeading(smoothedHeading);
        lastHeadingRef.current = smoothedHeading;
        
        console.log('🎯 Heading updated:', {
          raw: heading,
          smoothed: smoothedHeading,
          qiblaDirection: qiblaDirection,
          relativeAngle: (qiblaDirection - smoothedHeading + 360) % 360
        });
      }
    }
  };

  const setupCompass = () => {
    if (window.DeviceOrientationEvent) {
      // Remove any existing listener first
      if (compassListenerRef.current) {
        window.removeEventListener('deviceorientation', compassListenerRef.current, true);
      }

      compassListenerRef.current = handleCompass;
      
      // Add event listener with better error handling
      try {
        window.addEventListener('deviceorientation', handleCompass, true);
        setCompassActive(true);
        setCompassError('');
        console.log('🎯 Global compass activated successfully - event listener added');
        
        // Test if we're getting events
        setTimeout(() => {
          console.log('🔍 Compass status check - active:', compassActive, 'listener set:', !!compassListenerRef.current);
        }, 1000);
        
      } catch (error) {
        console.error('❌ Failed to add compass event listener:', error);
        setCompassError('Failed to start compass sensor');
      }
    } else {
      console.error('❌ DeviceOrientationEvent not supported');
      setCompassError('Compass not supported on this device');
    }
  };

  const stopCompass = () => {
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current, true);
      compassListenerRef.current = null;
    }
    setCompassActive(false);
    setDeviceHeading(0);
    lastHeadingRef.current = 0;
    console.log('⏹️ Global compass stopped');
  };

  const autoEnableCompass = async () => {
    if (compassActive || !window.DeviceOrientationEvent) {
      console.log('ℹ️ Compass already active or not supported');
      return;
    }

    console.log('🔄 Attempting to auto-enable global compass...');

    try {
      // Check if we already have permission
      const savedPermission = localStorage.getItem('compassPermission');
      
      if (savedPermission === 'granted') {
        // Already have permission - just enable compass
        console.log('✅ Already have compass permission - enabling global compass');
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
        console.log('🤖 Android/Desktop - auto-enabling global compass');
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
    
    console.log('🧭 Qibla angle calculation:', {
      qiblaDirection,
      deviceHeading,
      relativeDirection
    });
    
    return relativeDirection;
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
    setCompassError
  };

  return (
    <CompassContext.Provider value={value}>
      {children}
    </CompassContext.Provider>
  );
};