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
  Chip
} from '@mui/material';
import {
  Explore,
  Refresh,
  Navigation,
  MyLocation
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const compassRef = useRef(null);

  // High-precision Qibla calculation using reliable formula
  const calculateQiblaDirection = (lat, lng) => {
    const φ1 = lat * Math.PI / 180;
    const φ2 = 21.4225 * Math.PI / 180; // Mecca latitude
    const λ1 = lng * Math.PI / 180;
    const λ2 = 39.8262 * Math.PI / 180; // Mecca longitude

    const y = Math.sin(λ2 - λ1);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(λ2 - λ1);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing);
  };

  const startCompass = async () => {
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') {
          setError('Compass permission denied');
          return;
        }
      }

      window.addEventListener('deviceorientation', handleCompass, true);
      setCompassActive(true);
      setError('');
    } catch (err) {
      setError('Failed to start compass: ' + err.message);
    }
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientation', handleCompass, true);
    setCompassActive(false);
  };

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      // Use alpha for compass heading (0-360 degrees)
      let heading = event.alpha;
      
      // iOS sometimes provides absolute orientation
      if (typeof event.webkitCompassHeading !== 'undefined') {
        heading = event.webkitCompassHeading;
      }
      
      if (heading !== null && !isNaN(heading)) {
        setDeviceHeading(heading);
      }
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError('');

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
          console.log('📍 Qibla Direction Calculated:', direction + '°');
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
            errorMsg += 'Please enable location permissions.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMsg += 'Location information unavailable.';
            break;
          case err.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'An unknown error occurred.';
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

  // Calculate the angle for the Qibla arrow
  const getQiblaAngle = () => {
    if (!qiblaDirection || !compassActive) return qiblaDirection || 0;
    
    // When compass is active, arrow shows relative direction to Qibla
    const relativeDirection = (qiblaDirection - deviceHeading + 360) % 360;
    return relativeDirection;
  };

  useEffect(() => {
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
          <Explore sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Qibla Compass
          </Typography>

          {/* Compass Toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3, gap: 1 }}>
            <Chip 
              icon={<Navigation />} 
              label={compassActive ? "Compass Active" : "Enable Compass"} 
              color={compassActive ? "primary" : "default"} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "filled" : "outlined"}
              disabled={!qiblaDirection}
            />
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Compass Container */}
          <Box sx={{ 
            position: 'relative', 
            width: 280, 
            height: 280, 
            margin: '0 auto', 
            mb: 4
          }}>
            {/* Compass Outer Circle */}
            <Box sx={{
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: '4px solid',
              borderColor: 'primary.main', 
              position: 'relative', 
              backgroundColor: '#f8f9fa',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              
              {/* Compass Directions */}
              <Typography variant="h6" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: 8, 
                left: '50%', 
                transform: 'translateX(-50%)',
                color: '#d32f2f'
              }}>
                N
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: '50%', 
                right: 12, 
                transform: 'translateY(-50%)' 
              }}>
                E
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ 
                position: 'absolute', 
                bottom: 8, 
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}>
                S
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: 12, 
                transform: 'translateY(-50%)' 
              }}>
                W
              </Typography>

              {/* Degree Markings */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
                <Box
                  key={degree}
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 2,
                    height: degree % 90 === 0 ? 20 : 10,
                    backgroundColor: degree % 90 === 0 ? 'primary.main' : 'grey.400',
                    transform: `translate(-50%, -50%) rotate(${degree}deg)`,
                    transformOrigin: 'center bottom'
                  }}
                />
              ))}

              {/* Qibla Arrow - Centered and properly positioned */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 3,
                height: '40%',
                backgroundColor: '#d32f2f',
                transform: `translate(-50%, -100%) rotate(${currentAngle}deg)`,
                transformOrigin: 'bottom center',
                zIndex: 2,
                borderRadius: '2px',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderTop: '12px solid #d32f2f'
                }
              }} />

              {/* Center Pin */}
              <Box sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                width: 20, 
                height: 20,
                backgroundColor: 'primary.main', 
                borderRadius: '50%', 
                transform: 'translate(-50%, -50%)',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 3
              }} />

              {/* Compass Needle (North indicator) */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 2,
                height: '35%',
                backgroundColor: '#d32f2f',
                transform: `translate(-50%, -100%) rotate(0deg)`,
                transformOrigin: 'bottom center',
                zIndex: 1,
                opacity: 0.7
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
                  ? `Point ${currentAngle.toFixed(0)}° to your right` 
                  : `Face ${qiblaDirection}° from North`
                }
              </Typography>
            </Box>
          )}

          {/* Location Info */}
          {userLocation && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              <MyLocation sx={{ fontSize: 16, verticalAlign: 'text-bottom', mr: 0.5 }} />
              Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Typography>
          )}

          {/* Controls */}
          <Button 
            startIcon={<Refresh />} 
            onClick={getLocation}
            variant="contained"
            disabled={loading}
            size="large"
            sx={{ borderRadius: 3, px: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Recalibrate'}
          </Button>

          {/* Help Text */}
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
            Hold your device flat and rotate until the red arrow points straight up
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;