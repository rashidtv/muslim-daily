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
  const [compassAvailable, setCompassAvailable] = useState(false);
  const [usingSimulation, setUsingSimulation] = useState(false);
  
  const compassListenerRef = useRef(null);
  const lastHeadingRef = useRef(0);
  const eventCountRef = useRef(0);
  const nullEventCountRef = useRef(0);
  const userGestureRef = useRef(false);
  const simulationIntervalRef = useRef(null);

  useEffect(() => {
    checkCompassSupport();
    console.log('🌍 CompassProvider initialized');
    
    const enableOnGesture = () => {
      userGestureRef.current = true;
      console.log('👆 User gesture detected');
    };
    
    document.addEventListener('click', enableOnGesture);
    document.addEventListener('touchstart', enableOnGesture);
    
    return () => {
      document.removeEventListener('click', enableOnGesture);
      document.removeEventListener('touchstart', enableOnGesture);
      stopCompass();
    };
  }, []);

  const checkCompassSupport = () => {
    const orientationSupported = !!(window.DeviceOrientationEvent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    const isMobile = isIOS || isAndroid;
    
    // Check if this is likely to have actual compass hardware
    const likelyHasCompass = orientationSupported && isMobile;
    
    console.log(`🎯 Device Check:`, {
      orientationSupported,
      isIOS,
      isAndroid,
      isMobile,
      userAgent: navigator.userAgent,
      likelyHasCompass
    });
    
    setCompassSupported(orientationSupported);
    setCompassAvailable(likelyHasCompass);
    
    return orientationSupported;
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

    // iOS Safari
    if (typeof event.webkitCompassHeading !== 'undefined' && event.webkitCompassHeading !== null) {
      heading = event.webkitCompassHeading;
    }
    // Android and other browsers with absolute orientation
    else if (event.alpha !== null && (event.absolute === true || Math.abs(event.beta) < 90)) {
      heading = (360 - event.alpha) % 360;
    }

    if (heading !== null && !isNaN(heading)) {
      nullEventCountRef.current = 0;
      
      const smoothing = 0.2;
      const currentHeading = lastHeadingRef.current;
      let smoothedHeading;
      
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

      if (eventCountRef.current % 20 === 0) {
        console.log(`🎯 Real Compass: ${smoothedHeading.toFixed(1)}°`);
      }
    } else {
      nullEventCountRef.current++;
      
      // If we get too many null events, switch to simulation
      if (nullEventCountRef.current >= 5 && !usingSimulation) {
        console.log('🔧 Switching to compass simulation');
        setCompassAvailable(false);
        setUsingSimulation(true);
        startCompassSimulation();
      }
    }
  };

  const startCompassSimulation = () => {
    console.log('🎮 Starting compass simulation');
    stopCompass(); // Stop real compass listeners
    
    let simulatedHeading = deviceHeading || 0;
    
    simulationIntervalRef.current = setInterval(() => {
      // Simulate slight movements to make it feel alive
      simulatedHeading = (simulatedHeading + (Math.random() - 0.5) * 2) % 360;
      if (simulatedHeading < 0) simulatedHeading += 360;
      
      setDeviceHeading(simulatedHeading);
    }, 100);
    
    setCompassActive(true);
    setCompassError('Using compass simulation - move device to test');
  };

  const stopCompassSimulation = () => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
      console.log('⏹️ Stopped compass simulation');
    }
  };

  const setupCompass = () => {
    if (!compassSupported) {
      console.log('ℹ️ DeviceOrientation not supported');
      setCompassError('Compass not supported by your browser.');
      startCompassSimulation();
      return;
    }

    console.log('🔄 Setting up real compass...');

    // Remove any existing listener first
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
    }

    // Reset counters
    eventCountRef.current = 0;
    nullEventCountRef.current = 0;
    lastHeadingRef.current = deviceHeading || 0;

    // Stop any simulation
    stopCompassSimulation();
    setUsingSimulation(false);

    compassListenerRef.current = handleCompass;
    
    try {
      window.addEventListener('deviceorientation', handleCompass, true);
      console.log('✅ Real compass listener added');
      
      setCompassActive(true);
      setCompassError('');
      
      // Check if we're getting real data
      setTimeout(() => {
        console.log(`🔍 Compass Check: ${eventCountRef.current} events, ${nullEventCountRef.current} null events`);
        
        if (nullEventCountRef.current >= 3 && !usingSimulation) {
          console.log('🔄 No real compass data - starting simulation');
          startCompassSimulation();
        }
      }, 3000);
      
    } catch (error) {
      console.error('❌ Failed to setup real compass:', error);
      startCompassSimulation();
    }
  };

  const stopCompass = () => {
    if (compassListenerRef.current) {
      window.removeEventListener('deviceorientation', compassListenerRef.current);
      compassListenerRef.current = null;
    }
    stopCompassSimulation();
    
    setCompassActive(false);
    setUsingSimulation(false);
    setDeviceHeading(0);
    lastHeadingRef.current = 0;
    eventCountRef.current = 0;
    nullEventCountRef.current = 0;
    
    console.log('⏹️ Compass fully stopped');
  };

  const requestCompassPermission = async () => {
    console.log('🔐 Requesting compass permission...');
    
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        console.log('📱 iOS - requesting permission...');
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          console.log('✅ iOS compass permission granted');
          return true;
        } else {
          console.log('❌ iOS compass permission denied');
          setCompassError('Compass permission denied. Using simulation.');
          return false;
        }
      } else {
        console.log('🤖 No explicit permission needed');
        return true;
      }
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      setCompassError('Permission request failed. Using simulation.');
      return false;
    }
  };

  const autoEnableCompass = async () => {
    if (compassActive) {
      console.log('ℹ️ Compass already active');
      return;
    }

    console.log('🔄 Auto-enabling compass...');

    if (!userGestureRef.current) {
      console.log('⏳ Waiting for user gesture...');
      setCompassError('Tap the screen to enable compass...');
      return;
    }

    try {
      // For mobile devices, try real compass first
      if (compassAvailable) {
        const granted = await requestCompassPermission();
        if (granted) {
          setupCompass();
        } else {
          startCompassSimulation();
        }
      } else {
        // For desktop or devices without compass, use simulation
        console.log('💻 Desktop device - using compass simulation');
        startCompassSimulation();
      }
    } catch (error) {
      console.error('⚠️ Auto-enable failed:', error);
      startCompassSimulation();
    }
  };

  const manualStartCompass = async () => {
    userGestureRef.current = true;
    await autoEnableCompass();
  };

  const setUserLocationAndCalculateQibla = (latitude, longitude) => {
    setUserLocation({ latitude, longitude });
    const direction = calculateQiblaDirection(latitude, longitude);
    setQiblaDirection(direction);
    console.log(`📍 Qibla direction: ${direction}°`);
    
    autoEnableCompass();
  };

  const getQiblaAngle = () => {
    if (!qiblaDirection) return qiblaDirection || 0;
    
    if (!compassActive || deviceHeading === 0) {
      return qiblaDirection;
    }
    
    const relativeDirection = (qiblaDirection - deviceHeading + 360) % 360;
    return relativeDirection;
  };

  const debugCompass = () => {
    console.log('🔍 COMPASS DEBUG:', {
      qiblaDirection,
      deviceHeading,
      compassActive,
      compassSupported,
      compassAvailable,
      usingSimulation,
      userLocation,
      eventCount: eventCountRef.current,
      nullEventCount: nullEventCountRef.current,
      relativeAngle: getQiblaAngle(),
      compassError
    });
  };

  const testCompassMovement = () => {
    if (!compassActive) return;
    
    console.log('🧪 Testing compass movement...');
    let testHeading = deviceHeading || 0;
    const testInterval = setInterval(() => {
      testHeading = (testHeading + 20) % 360;
      setDeviceHeading(testHeading);
    }, 500);

    setTimeout(() => {
      clearInterval(testInterval);
      console.log('🧪 Compass test ended');
    }, 5000);
  };

  const value = {
    qiblaDirection,
    deviceHeading,
    compassActive,
    compassSupported,
    compassAvailable,
    usingSimulation,
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