import React, { useState, useEffect } from 'react';
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
  Snackbar
} from '@mui/material';
import {
  Explore,
  Refresh,
  Navigation,
  Place,
  NotificationsActive
} from '@mui/icons-material';
import { useNotification } from '../context/NotificationContext';
import { useCompass } from '../context/CompassContext';

const PrayerResources = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');
  const [isPWA, setIsPWA] = useState(false);
  const [showPWAAlert, setShowPWAAlert] = useState(false);
  const [gettingLocationName, setGettingLocationName] = useState(false);

  // Use the global compass context
  const {
    qiblaDirection,
    deviceHeading,
    compassActive,
    compassSupported,
    compassAvailable,
    userLocation,
    compassError,
    setUserLocationAndCalculateQibla,
    autoEnableCompass,
    stopCompass,
    getQiblaAngle,
    debugCompass,
    testCompassMovement
  } = useCompass();

  // Get notification status
  const { notificationsEnabled, loading: notificationsLoading, serviceWorkerReady } = useNotification();

  // Check PWA status on load
  useEffect(() => {
    checkPWA();
    // Auto-get location when component mounts
    if (!userLocation) {
      getLocation();
    } else {
      // If we already have location but compass isn't active, try to enable it
      if (!compassActive) {
        console.log('📍 Location exists but compass inactive - re-enabling...');
        autoEnableCompass();
      }
    }
  }, []);

  const checkPWA = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInPWA = window.navigator.standalone === true || isStandalone;
    setIsPWA(isInPWA);
    
    if (!isInPWA && !localStorage.getItem('pwaAlertShown')) {
      setShowPWAAlert(true);
      localStorage.setItem('pwaAlertShown', 'true');
    }
    
    console.log(`📱 PWA Mode: ${isInPWA}`);
    return isInPWA;
  };

  const getLocationName = async (latitude, longitude) => {
    setGettingLocationName(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch location name');
      }
      
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
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
        
        if (data.display_name) {
          const displayName = data.display_name.split(',').slice(0, 3).join(', ');
          setLocationName(displayName);
        }
      } else {
        setLocationName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      console.log('Error getting location name:', error);
      setLocationName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    } finally {
      setGettingLocationName(false);
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
        
        // Use the global compass context to set location and calculate Qibla
        setUserLocationAndCalculateQibla(latitude, longitude);
        
        getLocationName(latitude, longitude);
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
              {compassActive && ' • Compass auto-enabled!'}
            </Alert>
          )}

          {/* Service Worker Status */}
          {serviceWorkerReady && (
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body2">
                ✅ PWA Mode Active - Notifications will work even when app is closed
              </Typography>
            </Alert>
          )}

          {/* Prayer Notification Status */}
          {notificationsEnabled && (
            <Alert 
              severity="success" 
              sx={{ mb: 2 }}
              icon={<NotificationsActive />}
            >
              <Typography variant="body1" fontWeight="600">
                Prayer Time Notifications Enabled!
              </Typography>
              <Typography variant="body2">
                You'll receive automatic reminders for all 5 daily prayers based on your precise location.
              </Typography>
            </Alert>
          )}

          {!notificationsEnabled && !notificationsLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                🔔 Prayer time notifications will be enabled automatically...
              </Typography>
            </Alert>
          )}

          {notificationsLoading && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Setting up automatic prayer time notifications...
                </Typography>
              </Box>
            </Alert>
          )}

          {/* Compass Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
            <Chip 
              icon={<Navigation />}
              label={
                compassActive 
                  ? compassAvailable 
                    ? "Compass Active" 
                    : "Static Direction"
                  : "Compass Ready"
              } 
              color={
                compassActive 
                  ? compassAvailable 
                    ? "success" 
                    : "warning"
                  : "primary"
              }
              variant={compassActive ? "filled" : "outlined"}
            />
            {compassActive && compassAvailable && (
              <Chip 
                label="Auto" 
                size="small" 
                color="info" 
                variant="outlined"
              />
            )}
            {compassActive && !compassAvailable && (
              <Chip 
                label="Static" 
                size="small" 
                color="warning" 
                variant="outlined"
              />
            )}
          </Box>

          {(error || compassError) && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error || compassError}
            </Alert>
          )}

          {/* Location Information */}
          {userLocation && (
            <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Place sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                <Typography variant="h6" color="primary.main">
                  Your Precise Location
                </Typography>
              </Box>
              
              {gettingLocationName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress size={16} sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Getting location name...
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography variant="body1" fontWeight="medium" gutterBottom>
                    {locationName || `GPS: ${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)}`}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary" display="block">
                    Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                  </Typography>
                  {compassActive && (
                    <Typography variant="caption" color="success.main" display="block" fontWeight="medium">
                      {compassAvailable 
                        ? '✅ Compass auto-enabled & persistent' 
                        : '📍 Static Qibla direction (compass not available)'
                      }
                    </Typography>
                  )}
                </>
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
              borderColor: compassActive 
                ? (compassAvailable ? 'success.main' : 'warning.main') 
                : 'primary.main', 
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
                backgroundColor: compassActive 
                  ? (compassAvailable ? '#1976d2' : '#ed6c02') 
                  : '#90caf9',
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
                  borderBottom: `10px solid ${
                    compassActive 
                      ? (compassAvailable ? '#1976d2' : '#ed6c02') 
                      : '#90caf9'
                  }`
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
                  ? compassAvailable 
                    ? `Point device towards Mecca (${currentAngle.toFixed(0)}°)` 
                    : `Face ${qiblaDirection}° from North towards Mecca (Static)`
                  : `Face ${qiblaDirection}° from North towards Mecca`
                }
                {compassActive && compassAvailable && ' • Auto-enabled & Persistent'}
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
              onClick={compassActive ? stopCompass : autoEnableCompass}
              variant={compassActive ? "outlined" : "contained"}
              color={compassActive ? "secondary" : "primary"}
              disabled={!userLocation}
            >
              {compassActive ? 'Stop Compass' : 'Enable Compass'}
            </Button>

            {/* Debug Button */}
            <Button 
              startIcon={<Refresh />} 
              onClick={debugCompass}
              variant="outlined"
              color="secondary"
            >
              Debug Compass
            </Button>

            {/* Test Compass Button */}
            <Button 
              startIcon={<Refresh />} 
              onClick={testCompassMovement}
              variant="outlined"
              color="warning"
              disabled={!compassActive}
            >
              Test Compass
            </Button>
          </Box>

          {/* Compass Support Notice */}
          {!compassAvailable && compassActive && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Note:</strong> Your device doesn't have compass hardware or it's not accessible. 
                Showing static Qibla direction based on your location. For compass functionality, 
                try using a mobile device with compass hardware.
              </Typography>
            </Alert>
          )}

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