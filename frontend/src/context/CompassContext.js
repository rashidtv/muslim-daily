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
  const [compassSupported, setCompassSupported] = useState(true);
  const compassListenerRef = useRef(null);
  const lastHeadingRef = useRef(0);
  const eventCountRef = useRef(0);

  // Check compass permission status on load
  useEffect(() => {
    checkCompassPermissionStatus();
    checkCompassSupport();
    console.log('🌍 CompassProvider initialized');
  }, []);

  const checkCompassSupport = () => {
    const supported = !!(window.DeviceOrientationEvent);
    setCompassSupported(supported);
    console.log(`🎯 Compass supported: ${supported}`);
    return supported;
  };

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
    let dataSource = 'none';

    // For iOS Safari - most reliable
    if (typeof event.webkitCompassHeading !== 'undefined' && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
      dataSource = 'webkitCompassHeading';
      console.log(`📱 iOS Compass: ${heading}°`);
    }
    // For Android Chrome and other browsers with absolute orientation
    else if (event.alpha !== null && event.absolute === true) {
      // Convert device orientation to compass heading
      heading = (360 - event.alpha) % 360;
      dataSource = 'absolute-alpha';
      console.log(`🤖 Absolute Orientation - Alpha: ${event.alpha}°, Heading: ${heading}°`);
    }
    // For browsers with relative orientation (less accurate)
    else if (event.alpha !== null) {
      // This is relative orientation, not absolute compass - we can try to use it but it's less reliable
      heading = (360 - event.alpha) % 360;
      dataSource = 'relative-alpha';
      console.log(`🔄 Relative Orientation - Alpha: ${event.alpha}°, Heading: ${heading}° (may not be true North)`);
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

      console.log(`🎯 Compass Update [${dataSource}]: Raw ${heading}° → Smoothed ${smoothedHeading}°`);
    } else {
      console.warn('⚠️ No valid compass heading data:', {
        alpha: event.alpha,
        absolute: event.absolute,
        webkitCompassHeading: event.webkitCompassHeading,
        beta: event.beta,
        gamma: event.gamma,
        eventNumber: eventCountRef.current
      });

      // If we've received several events but no valid data, the device might not support compass
      if (eventCountRef.current > 10 && deviceHeading === 0) {
        console.warn('🔧 Device may not support compass - considering fallback options');
        setCompassError('Compass not available on this device. Using static Qibla direction.');
        setCompassSupported(false);
      }
    }
  };

  const setupCompass = () => {
    if (!compassSupported) {
      console.log('ℹ️ Compass not supported, skipping setup');
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
      // Try different event listener options
      const options = {
        capture: true
      };

      window.addEventListener('deviceorientation', handleCompass, options);
      
      setCompassActive(true);
      setCompassError('');
      console.log('🎯 Compass event listener added successfully');
      
      // Set up a test to check if events are coming through
      const testTimeout = setTimeout(() => {
        console.log(`🔍 Compass Status: ${eventCountRef.current} events received, heading: ${deviceHeading}°`);
        
        if (eventCountRef.current === 0) {
          console.warn('⚠️ No compass events received - device/browser may not support compass');
          setCompassError('Compass not supported. Using static Qibla direction.');
          setCompassSupported(false);
        } else if (deviceHeading === 0 && eventCountRef.current > 5) {
          console.warn('⚠️ Compass events received but no valid heading data');
          setCompassError('Compass data not available. Using static Qibla direction.');
        }
      }, 3000);

      return () => clearTimeout(testTimeout);
      
    } catch (error) {
      console.error('❌ Failed to add compass event listener:', error);
      setCompassError('Failed to start compass sensor: ' + error.message);
      setCompassSupported(false);
    }
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

    if (!compassSupported) {
      console.log('ℹ️ Compass not supported, using static direction');
      setCompassActive(true); // Still mark as active for UI, but with static direction
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
            setCompassError('Compass permission denied. Using static Qibla direction.');
            setCompassSupported(false);
          }
        } catch (err) {
          console.error('❌ iOS permission request failed:', err);
          setCompassError('Failed to request compass permission. Using static Qibla direction.');
          setCompassSupported(false);
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
      setCompassError('Failed to enable compass automatically. Using static Qibla direction.');
      setCompassSupported(false);
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
    if (!qiblaDirection) {
      return 0;
    }
    
    // If compass is not supported or not active, return static Qibla direction
    if (!compassSupported || !compassActive || deviceHeading === 0) {
      return qiblaDirection;
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
      compassSupported,
      compassPermissionGranted,
      userLocation,
      eventCount: eventCountRef.current,
      lastHeading: lastHeadingRef.current,
      hasListener: !!compassListenerRef.current,
      relativeAngle: getQiblaAngle(),
      compassError
    });
  };

  // Test function to simulate compass movement (for development)
  const testCompassMovement = () => {
    if (!compassActive) return;
    
    console.log('🧪 Testing compass movement...');
    let testHeading = 0;
    const testInterval = setInterval(() => {
      testHeading = (testHeading + 10) % 360;
      setDeviceHeading(testHeading);
      console.log(`🧪 Simulated compass: ${testHeading}°`);
    }, 500);

    // Stop after 10 seconds
    setTimeout(() => {
      clearInterval(testInterval);
      console.log('🧪 Compass test ended');
    }, 10000);
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
    compassSupported,
    userLocation,
    compassPermissionGranted,
    compassError,
    setUserLocationAndCalculateQibla,
    autoEnableCompass,
    stopCompass,
    setupCompass,
    getQiblaAngle,
    setCompassError,
    debugCompass,
    testCompassMovement // Add test function for development
  };

  return (
    <CompassContext.Provider value={value}>
      {children}
    </CompassContext.Provider>
  );
};