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
  Chip
} from '@mui/material';
import {
  CompassCalibration,
  Refresh,
  Navigation
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(0);
  const [loading, setLoading] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // High-precision Qibla calculation using spherical trigonometry
  const calculateQiblaDirection = (lat, lng) => {
    const meccaLat = 21.4225 * Math.PI / 180;
    const meccaLng = 39.8262 * Math.PI / 180;
    const userLat = lat * Math.PI / 180;
    const userLng = lng * Math.PI / 180;

    const y = Math.sin(meccaLng - userLng);
    const x = Math.cos(userLat) * Math.tan(meccaLat) - Math.sin(userLat) * Math.cos(meccaLng - userLng);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing * 10) / 10;
  };

  const startCompass = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleCompass);
            setCompassActive(true);
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleCompass);
      setCompassActive(true);
    }
  };

  const stopCompass = () => {
    window.removeEventListener('deviceorientation', handleCompass);
    setCompassActive(false);
    setDeviceHeading(0);
  };

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      // Smooth the compass reading to reduce jitter
      setDeviceHeading(prev => {
        const newHeading = event.alpha;
        if (prev === null) return newHeading;
        
        // Smoothing factor (0.1 = heavy smoothing, 0.9 = light smoothing)
        const smoothing = 0.2;
        return prev * (1 - smoothing) + newHeading * smoothing;
      });
    }
  };

  const getLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          const direction = calculateQiblaDirection(latitude, longitude);
          setQiblaDirection(direction);
          setLoading(false);
        } catch (error) {
          console.error('Calculation error:', error);
          setError('Error calculating Qibla direction');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Location error:', err);
        setError('Unable to get your location. Please ensure location services are enabled.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000 // 10 minutes cache
      }
    );
  };

  useEffect(() => {
    getLocation();
    
    return () => {
      window.removeEventListener('deviceorientation', handleCompass);
    };
  }, []);

  // Calculate arrow rotation based on compass mode
  const getArrowRotation = () => {
    if (!qiblaDirection) return 0;
    
    if (compassActive) {
      // In compass mode, arrow stays fixed pointing to Qibla while compass rotates
      return qiblaDirection;
    } else {
      // In static mode, arrow shows direction relative to North
      return qiblaDirection;
    }
  };

  const getCompassRotation = () => {
    if (!compassActive) return 0;
    return -deviceHeading;
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, gap: 1 }}>
            <Chip 
              icon={<Navigation />} 
              label={compassActive ? "Compass Active" : "Enable Live Compass"} 
              color={compassActive ? "primary" : "default"} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "filled" : "outlined"}
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
            width: 250, 
            height: 250, 
            margin: '0 auto', 
            mb: 3
          }}>
            {/* Compass Base - Rotates with device */}
            <Box sx={{
              width: '100%', 
              height: '100%', 
              borderRadius: '50%', 
              border: '3px solid',
              borderColor: 'primary.main', 
              position: 'relative', 
              backgroundColor: '#f8f9fa',
              transform: `rotate(${getCompassRotation()}deg)`,
              transition: compassActive ? 'transform 0.1s ease' : 'none'
            }}>
              {/* Compass Directions */}
              <Typography variant="caption" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: '5%', 
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}>
                N
              </Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: '50%', 
                right: '5%', 
                transform: 'translateY(-50%)' 
              }}>
                E
              </Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ 
                position: 'absolute', 
                bottom: '5%', 
                left: '50%', 
                transform: 'translateX(-50%)' 
              }}>
                S
              </Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ 
                position: 'absolute', 
                top: '50%', 
                left: '5%', 
                transform: 'translateY(-50%)' 
              }}>
                W
              </Typography>

              {/* Qibla Arrow - Always points to Mecca */}
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 2,
                height: '45%',
                backgroundColor: '#d32f2f',
                transform: `translateX(-50%) rotate(${getArrowRotation()}deg)`,
                transformOrigin: 'bottom center',
                zIndex: 2,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderBottom: '12px solid #d32f2f'
                }
              }} />

              {/* Center Dot */}
              <Box sx={{
                position: 'absolute', 
                top: '50%', 
                left: '50%', 
                width: 16, 
                height: 16,
                backgroundColor: 'primary.main', 
                borderRadius: '50%', 
                transform: 'translate(-50%, -50%)',
                border: '2px solid white',
                zIndex: 3
              }} />
            </Box>
          </Box>

          {/* Direction Display */}
          {qiblaDirection && (
            <>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                {compassActive 
                  ? 'Point your device towards the red arrow' 
                  : `Face ${qiblaDirection}° from North towards Mecca`
                }
              </Typography>
            </>
          )}

          {/* Location Info */}
          {userLocation ? (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Based on your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Getting your location...
            </Typography>
          )}

          {/* Controls */}
          <Button 
            startIcon={<Refresh />} 
            onClick={getLocation}
            variant="outlined"
            disabled={loading}
            sx={{ mb: 2 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Recalibrate Direction'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;