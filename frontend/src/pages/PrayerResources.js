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
  Explore,
  Refresh,
  Navigation,
  Place
} from '@mui/icons-material';
import { useCompass } from '../context/CompassContext';

const PrayerResources = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locationName, setLocationName] = useState('');

  const {
    qiblaDirection,
    deviceHeading,
    compassActive,
    userLocation,
    compassError,
    setUserLocationAndCalculateQibla,
    startCompass,
    stopCompass,
    getQiblaAngle
  } = useCompass();

  useEffect(() => {
    if (!userLocation) {
      getLocation();
    }
  }, []);

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        let locationParts = [];
        
        if (address.city) locationParts.push(address.city);
        else if (address.town) locationParts.push(address.town);
        else if (address.village) locationParts.push(address.village);
        
        if (address.state) locationParts.push(address.state);
        if (address.country) locationParts.push(address.country);
        
        setLocationName(locationParts.join(', '));
      }
    } catch (error) {
      setLocationName(`Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    }
  };

  const getLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocationAndCalculateQibla(latitude, longitude);
        getLocationName(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        setError('Unable to get your location');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const currentAngle = getQiblaAngle();

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Explore sx={{ fontSize: 48, color: 'primary.main', mr: 1 }} />
          </Box>
          
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Qibla Compass
          </Typography>

          {/* Compass Status */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Chip 
              icon={<Navigation />}
              label={compassActive ? "Compass Active" : "Enable Compass"} 
              color={compassActive ? "success" : "primary"}
              variant={compassActive ? "filled" : "outlined"}
            />
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
                  Your Location
                </Typography>
              </Box>
              
              <Typography variant="body1" fontWeight="medium" gutterBottom>
                {locationName || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
              </Typography>
            </Box>
          )}

          {/* Compass Container - FIXED ARROW DIRECTION */}
          <Box sx={{ 
            position: 'relative', 
            width: 250, 
            height: 250, 
            margin: '0 auto 32px auto',
            borderRadius: '50%',
            border: '3px solid',
            borderColor: compassActive ? 'success.main' : 'primary.main',
            backgroundColor: '#f8f9fa',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
              right: 8, 
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
              left: 8, 
              transform: 'translateY(-50%)' 
            }}>
              W
            </Typography>

            {/* Qibla Arrow - FIXED: Now pointing OUTWARD towards Mecca */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 2,
              height: '40%',
              backgroundColor: compassActive ? '#1976d2' : '#90caf9',
              // FIX: Transform from center pointing outward
              transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
              transformOrigin: 'center bottom', // Rotate from bottom center
              zIndex: 2,
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0, // Triangle at the TOP (outward end)
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: `12px solid ${compassActive ? '#1976d2' : '#90caf9'}` // Triangle pointing outward
              }
            }} />

            {/* Center Pin */}
            <Box sx={{
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              width: 16, 
              height: 16,
              backgroundColor: '#d32f2f', 
              borderRadius: '50%', 
              transform: 'translate(-50%, -50%)',
              border: '2px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              zIndex: 3
            }} />

            {/* Optional: Mecca indicator dot at the edge */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 8,
              height: 8,
              backgroundColor: '#2e7d32',
              borderRadius: '50%',
              transform: `translate(-50%, -50%) translate(0, -100px) rotate(${currentAngle}deg)`,
              transformOrigin: 'center 100px',
              zIndex: 1,
              opacity: 0.7
            }} />
          </Box>

          {/* Direction Display */}
          {qiblaDirection !== null && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h3" color="primary.main" gutterBottom fontWeight="bold">
                {qiblaDirection}°
              </Typography>
              <Typography variant="h6" gutterBottom color="text.primary">
                {compassActive 
                  ? `Point towards Mecca (${currentAngle.toFixed(0)}°)` 
                  : `Face ${qiblaDirection}° from North`
                }
              </Typography>
              {compassActive && (
                <Typography variant="body2" color="text.secondary">
                  Current heading: {deviceHeading.toFixed(0)}°
                </Typography>
              )}
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
              {loading ? <CircularProgress size={20} /> : 'Refresh Location'}
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

          {/* Instructions */}
          {!compassActive && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                Click "Start Compass" to enable compass functionality. On iOS, you may need to allow compass permissions.
              </Typography>
            </Alert>
          )}

          {/* Compass Help */}
          {compassActive && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Blue arrow points towards Mecca</strong>. Rotate your device until the arrow points straight up (0°) to face the Qibla direction.
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;