import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  Explore,
  Refresh,
  Navigation,
  MyLocation,
  CompassCalibration,
  InstallMobile,
  Place
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState('');
  const [showCompassDialog, setShowCompassDialog] = useState(false);
  const [compassPermissionRequested, setCompassPermissionRequested] = useState(false);
  const [isPWA, setIsPWA] = useState(false);
  const [showPWAAlert, setShowPWAAlert] = useState(false);
  const [gettingLocationName, setGettingLocationName] = useState(false);

  // Check if running in PWA mode
  const checkPWA = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInPWA = window.navigator.standalone === true || isStandalone;
    setIsPWA(isInPWA);
    
    if (!isInPWA && !localStorage.getItem('pwaAlertShown')) {
      setShowPWAAlert(true);
      localStorage.setItem('pwaAlertShown', 'true');
    }
    
    return isInPWA;
  };

  // Reverse geocoding to get location name
  const getLocationName = async (latitude, longitude) => {
    setGettingLocationName(true);
    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location name');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        
        // Build location name in a readable format
        let locationParts = [];
        
        if (address.city) {
          locationParts.push(address.city);
        } else if (address.town) {
          locationParts.push(address.town);
        } else if (address.village) {
          locationParts.push(address.village);
        }
        
        if (address.state && !locationParts.includes(address.state)) {
          locationParts.push(address.state);
        }
        
        if (address.country && !locationParts.includes(address.country)) {
          locationParts.push(address.country);
        }
        
        const locationString = locationParts.join(', ');
        setLocationName(locationString);
        
        // Also try to get more detailed name
        if (data.display_name) {
          const displayName = data.display_name.split(',').slice(0, 3).join(', ');
          setLocationName(displayName);
        }
      } else {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      // Fallback to coordinates if reverse geocoding fails
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setGettingLocationName(false);
    }
  };

  // Alternative geocoding service (LocationIQ - requires free API key)
  const getLocationNameWithLocationIQ = async (latitude, longitude) => {
    // You can get a free API key from https://locationiq.com/
    const API_KEY = 'your_locationiq_api_key_here'; // Replace with your actual key
    
    try {
      const response = await fetch(
        `https://us1.locationiq.com/v1/reverse.php?key=${API_KEY}&lat=${latitude}&lon=${longitude}&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location name');
      }
      
      const data = await response.json();
      
      if (data && data.display_name) {
        const displayName = data.display_name.split(',').slice(0, 3).join(', ');
        setLocationName(displayName);
      }
    } catch (error) {
      console.log('LocationIQ error:', error);
      // Fallback to OpenStreetMap
      getLocationName(latitude, longitude);
    }
  };

  // High-precision Qibla calculation
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

  const startCompass = async () => {
    try {
      setLoading(true);
      
      if (!window.DeviceOrientationEvent) {
        setError('Compass not supported on this device');
        setLoading(false);
        return;
      }

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            setupCompass();
          } else {
            setError('Compass permission denied. ' + 
              (isPWA ? 'Check device settings.' : 'Try installing as PWA for better experience.'));
            setShowCompassDialog(true);
          }
        } catch (err) {
          setError('Failed to get compass permission');
          setShowCompassDialog(true);
        }
      } else {
        setupCompass();
      }
    } catch (err) {
      setError('Failed to start compass: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupCompass = () => {
    window.addEventListener('deviceorientation', handleCompass, true);
    setCompassActive(true);
    setError('');
    setShowCompassDialog(false);
  };

  const autoEnableCompass = async () => {
    if (compassPermissionRequested || compassActive) return;

    setCompassPermissionRequested(true);
    
    setTimeout(async () => {
      try {
        if (isPWA || typeof DeviceOrientationEvent.requestPermission !== 'function') {
          if (window.DeviceOrientationEvent) {
            setupCompass();
          }
        } else {
          setShowCompassDialog(true);
        }
      } catch (err) {
        console.log('Auto-enable compass failed:', err);
      }
    }, 1500);
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientation', handleCompass, true);
    setCompassActive(false);
  };

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      let heading = event.alpha;
      
      if (typeof event.webkitCompassHeading !== 'undefined') {
        heading = event.webkitCompassHeading;
      }
      
      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(prev => {
          if (prev === null) return heading;
          const smoothing = 0.1;
          return prev * (1 - smoothing) + heading * smoothing;
        });
      }
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError('');
    setLocationName('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          const direction = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(direction);
          
          // Get location name
          getLocationName(latitude, longitude);
          
          // Auto-enable compass after getting location
          autoEnableCompass();
        } catch (error) {
          console.error('Calculation error:', error);
          setError('Error calculating Qibla direction');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        let errorMsg = 'Unable to get your location. ';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMsg += isPWA ? 
              'Please enable location permissions in app settings.' :
              'Please enable location permissions.';
            break;
          default:
            errorMsg += 'Please try again.';
        }
        
        setError(errorMsg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000
      }
    );
  };

  const getQiblaAngle = () => {
    if (!qiblaDirection || !compassActive) return qiblaDirection || 0;
    const relativeDirection = (qiblaDirection - deviceHeading + 360) % 360;
    return relativeDirection;
  };

  useEffect(() => {
    checkPWA();
    getLocation();
    
    return () => {
      window.removeEventListener('deviceorientation', handleCompass, true);
    };
  }, []);

  const currentAngle = getQiblaAngle();

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Explore sx={{ fontSize: 48, color: 'primary.main', mr: 1 }} />
            {isPWA && (
              <Chip 
                label="PWA" 
                size="small" 
                color="success" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Qibla Compass
          </Typography>

          {isPWA && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Running in app mode - Best experience! 
            </Alert>
          )}

          {/* Compass Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
            <Chip 
              icon={compassActive ? <Navigation /> : <CompassCalibration />}
              label={compassActive ? "Compass Active" : "Enable Compass"} 
              color={compassActive ? "success" : "primary"}
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "filled" : "outlined"}
              disabled={!qiblaDirection || loading}
            />
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Location Information */}
          {userLocation && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Place sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Your Location
                </Typography>
              </Box>
              
              {gettingLocationName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Getting location name...
                  </Typography>
                </Box>
              ) : locationName ? (
                <>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {locationName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Typography>
              )}
            </Box>
          )}

          {/* Compass Container */}
          <Box sx={{ 
            position: 'relative', 
            width: 280, 
            height: 280, 
            margin: '0 auto', 
            mb: 4
          }}>
            <Box sx={{
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: '4px solid',
              borderColor: compassActive ? 'success.main' : 'primary.main', 
              position: 'relative', 
              backgroundColor: '#f8f9fa',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              opacity: compassActive ? 1 : 0.8
            }}>
              
              {/* Compass Directions */}
              <Typography variant="h6" fontWeight="bold" sx={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', color: '#d32f2f' }}>N</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: 12, transform: 'translateY(-50%)' }}>E</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)' }}>W</Typography>

              {/* Qibla Arrow */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 3,
                height: '45%',
                backgroundColor: compassActive ? '#1976d2' : '#90caf9',
                transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
                transformOrigin: 'center center',
                zIndex: 2,
                borderRadius: '2px',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: '-10px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: `10px solid ${compassActive ? '#1976d2' : '#90caf9'}`
                }
              }} />

              {/* Center Pin */}
              <Box sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                width: 20, 
                height: 20,
                backgroundColor: '#d32f2f', 
                borderRadius: '50%', 
                transform: 'translate(-50%, -50%)',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 3
              }} />
            </Box>
          </Box>

          {/* Direction Display */}
          {qiblaDirection !== null && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" color="primary.main" gutterBottom fontWeight="bold">
                {qiblaDirection}°
              </Typography>
              <Typography variant="h6" gutterBottom color="text.primary">
                {compassActive 
                  ? `Point device towards Mecca (${currentAngle.toFixed(0)}°)` 
                  : `Face ${qiblaDirection}° from North`
                }
              </Typography>
            </Box>
          )}

          {/* Controls */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button 
              startIcon={<Refresh />} 
              onClick={getLocation}
              variant="outlined"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Recalibrate'}
            </Button>
            
            <Button 
              startIcon={<Navigation />} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "outlined" : "contained"}
              color={compassActive ? "secondary" : "primary"}
            >
              {compassActive ? 'Stop Compass' : 'Start Compass'}
            </Button>
          </Box>

          {/* PWA Benefits Notice */}
          {!isPWA && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Tip:</strong> Install as app for better compass performance and offline access!
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Compass Permission Dialog */}
      <Dialog open={showCompassDialog} onClose={() => setShowCompassDialog(false)}>
        <DialogTitle>
          <CompassCalibration sx={{ mr: 1, verticalAlign: 'middle' }} />
          Enable Compass
        </DialogTitle>
        <DialogContent>
          <Typography>
            To use the live compass feature, we need access to your device's orientation sensors.
          </Typography>
          {!isPWA && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <InstallMobile sx={{ fontSize: 16, mr: 1 }} />
              For best experience, install this app to your home screen!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompassDialog(false)}>Cancel</Button>
          <Button onClick={startCompass} variant="contained">
            Enable Compass
          </Button>
        </DialogActions>
      </Dialog>

      {/* PWA Installation Prompt */}
      <Snackbar
        open={showPWAAlert && !isPWA}
        onClose={() => setShowPWAAlert(false)}
        message="Install this app for better compass performance and offline access!"
        action={
          <Button color="primary" size="small" onClick={() => setShowPWAAlert(false)}>
            OK
          </Button>
        }
      />
    </Container>
  );
};

export default PrayerResources;