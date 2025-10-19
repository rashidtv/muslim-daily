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
  Mosque,
  Refresh,
  Navigation
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(292);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Get Qibla from Aladhan API
  const getQiblaFromAPI = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/qibla/${lat}/${lng}`
      );
      const data = await response.json();
      
      if (data.code === 200 && data.data && data.data.direction) {
        return Math.round(data.data.direction);
      }
      throw new Error('Invalid API response');
    } catch (error) {
      console.log('API failed, using calculation');
      return calculateReliableQibla(lat, lng);
    }
  };

  const calculateReliableQibla = (lat, lng) => {
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

  // COMPASS FUNCTIONALITY
  const startCompass = () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS - needs permission
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleCompass);
            setCompassActive(true);
          }
        })
        .catch(console.error);
    } else {
      // Android and others
      window.addEventListener('deviceorientation', handleCompass);
      setCompassActive(true);
    }
  };

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      setDeviceHeading(event.alpha); // Compass heading (0-360)
    }
  };

  // Calculate relative direction when compass is active
  const getRelativeDirection = () => {
    if (!compassActive || deviceHeading === null) return qiblaDirection;
    
    // Calculate where Qibla is relative to device heading
    let relative = qiblaDirection - deviceHeading;
    if (relative < 0) relative += 360;
    return Math.round(relative);
  };

  const getLocation = async () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          const direction = await getQiblaFromAPI(latitude, longitude);
          setQiblaDirection(direction);
          setLoading(false);
        } catch (error) {
          setQiblaDirection(292);
          setLoading(false);
        }
      },
      (err) => {
        setQiblaDirection(292);
        setLoading(false);
        setError('Enable location for accurate Qibla');
      }
    );
  };

  useEffect(() => {
    getLocation();
    
    return () => {
      window.removeEventListener('deviceorientation', handleCompass);
    };
  }, []);

  const displayDirection = compassActive ? getRelativeDirection() : qiblaDirection;

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          
          {/* Compass Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip 
              icon={<Navigation />} 
              label={compassActive ? "Compass Active - Move Phone" : "Tap to Enable Compass"} 
              color={compassActive ? "primary" : "default"} 
              onClick={!compassActive ? startCompass : undefined}
            />
          </Box>

          {error && <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>}

          {/* COMPASS - Rotates with device */}
          <Box sx={{ 
            position: 'relative', 
            width: 200, 
            height: 200, 
            margin: '0 auto', 
            mb: 3,
            transform: compassActive ? `rotate(${-deviceHeading}deg)` : 'none',
            transition: 'transform 0.1s ease'
          }}>
            <Box sx={{
              width: '100%', height: '100%', borderRadius: '50%', border: '3px solid',
              borderColor: 'primary.main', position: 'relative', backgroundColor: '#f8f9fa'
            }}>
              {/* Qibla Arrow - Always points to Mecca */}
              <Box sx={{
                position: 'absolute', top: '10%', left: '50%', width: 4, height: '40%',
                backgroundColor: '#FF0000', 
                transform: `translateX(-50%) rotate(${compassActive ? 0 : qiblaDirection}deg)`,
                transformOrigin: 'bottom center'
              }} />
              
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%', width: 16, height: 16,
                backgroundColor: 'primary.main', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                border: '2px solid white'
              }} />

              <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)' }}>N</Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)' }}>E</Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
              <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)' }}>W</Typography>
            </Box>
          </Box>

          <Typography variant="h4" color="primary.main" gutterBottom>
            {displayDirection}°
          </Typography>
          
          <Typography variant="body1" gutterBottom>
            {compassActive 
              ? 'Red arrow points to Qibla - rotate your phone' 
              : 'Face this direction towards Mecca'
            }
          </Typography>

          <Button 
            startIcon={<Refresh />} 
            onClick={getLocation}
            variant="outlined"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? <CircularProgress size={20} /> : 'Recalibrate'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;