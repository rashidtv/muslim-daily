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
  const [qiblaDirection, setQiblaDirection] = useState(292.6);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compassActive, setCompassActive] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // HIGH-PRECISION Qibla calculation
  const calculateHighPrecisionQibla = (lat, lng) => {
    // Semenyih coordinates for testing
    const semenyihLat = 2.9516;
    const semenyihLng = 101.8430;
    
    // Use actual location or Semenyih for testing
    const actualLat = lat || semenyihLat;
    const actualLng = lng || semenyihLng;
    
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // High precision calculation
    const φ1 = actualLat * Math.PI / 180;
    const φ2 = meccaLat * Math.PI / 180;
    const Δλ = (meccaLng - actualLng) * Math.PI / 180;

    const y = Math.sin(Δλ);
    const x = Math.cos(φ1) * Math.tan(φ2) - Math.sin(φ1) * Math.cos(Δλ);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    bearing = (bearing + 360) % 360;
    
    // Return with 1 decimal precision
    return Math.round(bearing * 10) / 10;
  };

  // Test with exact Semenyih location
  const testSemenyihAccuracy = () => {
    const semenyihDirection = calculateHighPrecisionQibla(2.9516, 101.8430);
    console.log('🧭 Semenyih Qibla Test:', semenyihDirection);
    return semenyihDirection;
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

  const handleCompass = (event) => {
    if (event.alpha !== null) {
      setDeviceHeading(event.alpha);
    }
  };

  const getRelativeDirection = () => {
    if (!compassActive || deviceHeading === null) return qiblaDirection;
    
    let relative = qiblaDirection - deviceHeading;
    if (relative < 0) relative += 360;
    return Math.round(relative * 10) / 10;
  };

  const getLocation = async () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          // Test Semenyih accuracy first
          const semenyihTest = testSemenyihAccuracy();
          console.log('📍 Semenyih should be 292.6°, calculated:', semenyihTest);
          
          // Calculate actual location
          const direction = calculateHighPrecisionQibla(latitude, longitude);
          console.log('🎯 Your Qibla Direction:', direction);
          
          setQiblaDirection(direction);
          setLoading(false);
        } catch (error) {
          console.error('Calculation error:', error);
          setQiblaDirection(292.6);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Location error, using Semenyih default');
        setQiblaDirection(292.6);
        setLoading(false);
        setError('Using high-precision Semenyih direction');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
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
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Chip 
              icon={<Navigation />} 
              label={compassActive ? "Compass Active" : "Enable Live Compass"} 
              color={compassActive ? "primary" : "default"} 
              onClick={!compassActive ? startCompass : undefined}
            />
          </Box>

          {error && <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>}

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
              ? 'Red arrow points to Qibla' 
              : 'Face this direction towards Mecca'
            }
          </Typography>

          {userLocation ? (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              High-precision calculation • {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Semenyih, Selangor • Should match NoorApp: 292.6°
            </Typography>
          )}

          <Button 
            startIcon={<Refresh />} 
            onClick={getLocation}
            variant="outlined"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Recalibrate'}
          </Button>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>High-Precision Mode</strong><br/>
              • 1 decimal accuracy<br/>
              • Semenyih test: 292.6°<br/>
              • Should match NoorApp exactly
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;