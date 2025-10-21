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
  const [compassAvailable, setCompassAvailable] = useState(true);
  const compassListenerRef = useRef(null);
  const lastHeadingRef = useRef(0);
  const eventCountRef = useRef(0);
  const nullEventCountRef = useRef(0);
  const userGestureRef = useRef(false);

  // Check compass permission status on load
  useEffect(() => {
    checkCompassPermissionStatus();
    checkCompassSupport();
    console.log('🌍 CompassProvider initialized');
    
    // Listen for user gestures to enable compass
    const enableOnGesture = () => {
      userGestureRef.current = true;
      console.log('👆 User gesture detected - compass can be enabled');
    };
    
    document.addEventListener('click', enableOnGesture);
    document.addEventListener('touchstart', enableOnGesture);
    
    return () => {
      document.removeEventListener('click', enableOnGesture);
      document.removeEventListener('touchstart', enableOnGesture);
    };
  }, []);

  const checkCompassSupport = () => {
    const orientationSupported = !!(window.DeviceOrientationEvent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    
    console.log(`🎯 Device Check:`, {
      orientationSupported,
      isIOS,
      isAndroid,
      isMobile,
      userAgent: navigator.userAgent
    });
    
    setCompassSupported(orientationSupported);
    setCompassAvailable(orientationSupported && isMobile);
    
    return orientationSupported;
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
    }
    // For Android and other browsers
    else if (event.alpha !== null) {
      // Check if this is absolute orientation (compass) or relative (device orientation)
      if (event.absolute === true || Math.abs(event.beta) < 90) {
        // Convert to compass heading
        heading = (360 - event.alpha) % 360;
        dataSource = 'absolute-alpha';
      } else {
        // Relative orientation - not a compass
        heading = (360 - event.alpha) % 360;
        dataSource = 'relative-alpha';
      }
    }

    if (heading !== null && !isNaN(heading)) {
      // Reset null counter since we got valid data
      nullEventCountRef.current = 0;
      
      // Smooth the heading changes
      const smoothing = 0.2;
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

      if (eventCountRef.current % 10 === 0) { // Log every 10th event to avoid spam
        console.log(`🎯 Compass [${dataSource}]: ${smoothedHeading.toFixed(1)}°`);
      }
    } else {
      nullEventCountRef.current++;
      
      if (nullEventCountRef.current % 5 === 0) { // Log every 5th null event
        console.warn('⚠️ No compass data:', {
          alpha: event.alpha,
          absolute: event.absolute,
          webkitCompassHeading: event.webkitCompassHeading,
          beta: event.beta,
          gamma: event.gamma
        });
      }

      // If we've received many null events, compass might not be available
      if (nullEventCountRef.current >= 10) {
        console.log('🔧 Compass not providing data - might be hardware limitation');
        setCompassAvailable(false);
        setCompassError('Compass data not available from device sensors.');
      }
    }
  };

  const setupCompass = () => {
    if (!compassSupported) {
      console.log('ℹ️ DeviceOrientation not supported');
      setCompassError('Compass not supported by your browser.');
      return;
    }

    console.log('🔄 Setting up compass...');

    // Remove any existing listener first
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
      console.log('🗑️ Removed previous compass listener');
    }

    // Reset counters
    eventCountRef.current = 0;
    nullEventCountRef.current = 0;
    lastHeadingRef.current = deviceHeading || 0;

    // Set up new listener
    compassListenerRef.current = handleCompass;
    
    try {
      // Try different approaches for different browsers
      let optionsSupported = false;
      
      // Try with options first (modern browsers)
      try {
        window.addEventListener('deviceorientation', handleCompass, {
          capture: true,
          passive: true
        });
        optionsSupported = true;
        console.log('✅ Compass listener added with options');
      } catch (e) {
        console.log('⚠️ Options not supported, using basic listener');
      }
      
      // If options failed, use basic listener
      if (!optionsSupported) {
        window.addEventListener('deviceorientation', handleCompass, true);
        console.log('✅ Compass listener added (basic)');
      }
      
      setCompassActive(true);
      setCompassError('');
      
      // Check if we're getting data
      setTimeout(() => {
        console.log(`🔍 Compass Status: ${eventCountRef.current} events, ${nullEventCountRef.current} null events`);
        
        if (eventCountRef.current === 0) {
          console.warn('⚠️ No compass events received');
          setCompassError('No compass data received. Try refreshing or checking permissions.');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Failed to setup compass:', error);
      setCompassError('Failed to access compass: ' + error.message);
      setCompassAvailable(false);
    }
  };

  const stopCompass = () => {
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
      compassListenerRef.current = null;
      console.log('⏹️ Compass stopped');
    }
    setCompassActive(false);
    setDeviceHeading(0);
    lastHeadingRef.current = 0;
    eventCountRef.current = 0;
    nullEventCountRef.current = 0;
  };

  const requestCompassPermission = async () => {
    console.log('🔐 Requesting compass permission...');
    
    try {
      // iOS Safari requires explicit permission
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('📱 iOS - requesting permission...');
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          console.log('✅ iOS compass permission granted');
          localStorage.setItem('compassPermission', 'granted');
          setCompassPermissionGranted(true);
          return true;
        } else {
          console.log('❌ iOS compass permission denied');
          localStorage.setItem('compassPermission', 'denied');
          setCompassError('Compass permission denied. Please enable in settings.');
          return false;
        }
      }
      // Android and others don't require explicit permission
      else {
        console.log('🤖 Non-iOS device - no explicit permission needed');
        localStorage.setItem('compassPermission', 'granted');
        setCompassPermissionGranted(true);
        return true;
      }
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      setCompassError('Failed to request compass permission.');
      return false;
    }
  };

  const autoEnableCompass = async () => {
    if (compassActive) {
      console.log('ℹ️ Compass already active');
      return;
    }

    if (!compassSupported) {
      console.log('ℹ️ Compass not supported');
      setCompassError('Compass not supported by your device/browser.');
      return;
    }

    console.log('🔄 Auto-enabling compass...');

    // Check if we need user gesture (some browsers require this)
    if (!userGestureRef.current) {
      console.log('⏳ Waiting for user gesture...');
      setCompassError('Tap anywhere to enable compass...');
      return;
    }

    try {
      // Check permission status
      const savedPermission = localStorage.getItem('compassPermission');
      
      if (savedPermission === 'granted') {
        console.log('✅ Permission already granted - setting up compass');
        setupCompass();
      } else if (savedPermission === 'denied') {
        console.log('❌ Permission previously denied');
        setCompassError('Compass permission was denied. Please reset permissions in browser settings.');
      } else {
        // No permission saved - request it
        console.log('🔐 No permission saved - requesting...');
        const granted = await requestCompassPermission();
        if (granted) {
          setupCompass();
        }
      }
    } catch (error) {
      console.error('⚠️ Auto-enable failed:', error);
      setCompassError('Failed to enable compass: ' + error.message);
    }
  };

  const setUserLocationAndCalculateQibla = (latitude, longitude) => {
    setUserLocation({ latitude, longitude });
    const direction = calculateQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    console.log(`📍 Qibla direction: ${direction}°`);
    
    // Auto-enable compass when location is set
    autoEnableCompass();
  };

  const getQiblaAngle = () => {
    if (!qiblaDirection) return 0;
    
    if (!compassAvailable || !compassActive || deviceHeading === 0) {
      return qiblaDirection;
    }
    
    const relativeDirection = (qiblaDirection - deviceHeading + 360) % 360;
    return relativeDirection;
  };

  // Debug function
  const debugCompass = () => {
    console.log('🔍 COMPASS DEBUG:', {
      qiblaDirection,
      deviceHeading,
      compassActive,
      compassSupported,
      compassAvailable,
      compassPermissionGranted,
      userLocation,
      eventCount: eventCountRef.current,
      nullEventCount: nullEventCountRef.current,
      userGesture: userGestureRef.current,
      hasListener: !!compassListenerRef.current,
      relativeAngle: getQiblaAngle(),
      compassError
    });
  };

  // Test function
  const testCompassMovement = () => {
    if (!compassActive) return;
    
    console.log('🧪 Testing compass movement...');
    let testHeading = deviceHeading || 0;
    const testInterval = setInterval(() => {
      testHeading = (testHeading + 15) % 360;
      setDeviceHeading(testHeading);
    }, 300);

    setTimeout(() => {
      clearInterval(testInterval);
      console.log('🧪 Compass test ended');
    }, 8000);
  };

  // Manual compass start (for user-initiated activation)
  const manualStartCompass = async () => {
    userGestureRef.current = true;
    await autoEnableCompass();
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (compassListenerRef.current) {
        window.removeEventListener('deviceorientation', compassListenerRef.current);
      }
    };
  }, []);

  const value = {
    qiblaDirection,
    deviceHeading,
    compassActive,
    compassSupported,
    compassAvailable,
    userLocation,
    compassPermissionGranted,
    compassError,
    setUserLocationAndCalculateQibla,
    autoEnableCompass,
    manualStartCompass,
    stopCompass,
    getQiblaAngle,
    debugCompass,
    testCompassMovement
  };

  return (
    <CompassContext.Provider value={value}>
      {children}
    </CompassContext.Provider>
  );
};