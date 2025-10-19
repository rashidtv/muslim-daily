import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  CompassCalibration,
  Mosque,
  Refresh,
  Navigation
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [compassPermission, setCompassPermission] = useState(false);

  // Calculate Qibla direction from coordinates
  const calculateQiblaDirection = (lat, lng) => {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const meccaLatRad = meccaLat * Math.PI / 180;
    const meccaLngRad = meccaLng * Math.PI / 180;

    const y = Math.sin(meccaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLngRad - lngRad);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    return (qibla + 360) % 360;
  };

  // Calculate relative direction based on device orientation
  const calculateRelativeDirection = (qiblaAbsolute, deviceHeading) => {
    if (qiblaAbsolute === null || deviceHeading === null) return null;
    
    let relative = qiblaAbsolute - deviceHeading;
    if (relative < 0) relative += 360;
    return relative;
  };

  // Start compass
  const startCompass = async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleCompass);
          setCompassPermission(true);
        }
      } catch (error) {
        console.log('Compass permission denied');
      }
    } else {
      window.addEventListener('deviceorientation', handleCompass);
      setCompassPermission(true);
    }
  };

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      setDeviceHeading(event.alpha);
    }
  };

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(Math.round(direction));
        setLoading(false);
        
        // Auto-start compass after getting location
        startCompass();
      },
      (err) => {
        setError('Location access required for Qibla direction');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const relativeDirection = calculateRelativeDirection(qiblaDirection, deviceHeading);
  const displayDirection = compassPermission && relativeDirection !== null ? relativeDirection : qiblaDirection;

  const Compass = ({ direction }) => (
    <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
      <Box sx={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: '3px solid',
        borderColor: 'primary.main',
        position: 'relative',
        backgroundColor: '#f8f9fa',
        transform: compassPermission ? `rotate(${-deviceHeading}deg)` : 'none',
        transition: 'transform 0.1s ease'
      }}>
        {/* Qibla Arrow */}
        <Box sx={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          width: 4,
          height: '40%',
          backgroundColor: '#FF0000',
          transform: `translateX(-50%) rotate(${compassPermission ? 0 : direction}deg)`,
          transformOrigin: 'bottom center',
          boxShadow: '0 0 8px rgba(255,0,0,0.6)'
        }} />
        
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: 12,
          height: 12,
          backgroundColor: 'primary.main',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
          border: '2px solid white'
        }} />

        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '2%', left: '50%', transform: 'translateX(-50%)' }}>N</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '2%', transform: 'translateY(-50%)' }}>E</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '2%', left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '2%', transform: 'translateY(-50%)' }}>W</Typography>
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Qibla Direction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {compassPermission ? 'Move your device to find Qibla' : 'Enable compass for live direction'}
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Getting your location...
              </Typography>
            </Box>
          ) : qiblaDirection !== null && (
            <>
              <Compass direction={qiblaDirection} />
              
              <Typography variant="h4" color="primary.main" gutterBottom>
                {displayDirection !== null ? Math.round(displayDirection) : qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 2 }}>
                {compassPermission 
                  ? 'Red arrow points to Qibla' 
                  : 'Face this direction for prayer'
                }
              </Typography>

              {!compassPermission && (
                <Button 
                  startIcon={<Navigation />}
                  onClick={startCompass}
                  variant="contained"
                  sx={{ mb: 2 }}
                >
                  Enable Compass
                </Button>
              )}

              <Button 
                startIcon={<Refresh />}
                onClick={getUserLocation}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Recalibrate
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Mosque sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mosque Finder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find nearby mosques and prayer facilities
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;