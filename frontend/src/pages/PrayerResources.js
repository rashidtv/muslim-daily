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
  Refresh,
  Navigation,
  MyLocation,
  CompassCalibration
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
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.address) {
        const address = data.address;
        let locationParts = [];
        
        if (address.city_district) {
          locationParts.push(address.city_district);
        } else if (address.suburb) {
          locationParts.push(address.suburb);
        } else if (address.city) {
          locationParts.push(address.city);
        } else if (address.town) {
          locationParts.push(address.town);
        } else if (address.village) {
          locationParts.push(address.village);
        }
        
        if (address.state) {
          locationParts.push(address.state);
        }
        
        if (locationParts.length > 0) {
          setLocationName(locationParts.join(', '));
        } else {
          setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } else {
        setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
    } catch (error) {
      setLocationName(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
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
    <Container maxWidth="sm" sx={{ py: 2, px: { xs: 1, sm: 2 } }}>
      <Card 
        elevation={1}
        sx={{
          background: 'white',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 3 }}>
          
          {/* Simple Header */}
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h5" 
              fontWeight="600" 
              color="primary.main"
              gutterBottom
            >
              Qibla Compass
            </Typography>
            <Chip 
              icon={<Navigation />}
              label={compassActive ? "ACTIVE" : "READY"} 
              color={compassActive ? "success" : "default"}
              variant="outlined"
              size="small"
            />
          </Box>

          {/* Error Messages */}
          {(error || compassError) && (
            <Alert 
              severity="warning" 
              sx={{ mb: 3, borderRadius: 1 }}
            >
              {error || compassError}
            </Alert>
          )}

          {/* Location Display */}
          {userLocation && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              borderRadius: 2,
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <MyLocation sx={{ fontSize: 18, color: 'primary.main', mr: 1 }} />
                <Typography variant="body1" color="primary.main" fontWeight="500">
                  Your Location
                </Typography>
              </Box>
              
              <Typography variant="body1" gutterBottom>
                {locationName}
              </Typography>
              
              <Typography variant="caption" color="text.secondary">
                Qibla Direction: <strong>{qiblaDirection}°</strong>
              </Typography>
            </Box>
          )}

          {/* Clean Compass Design */}
          <Box sx={{ 
            position: 'relative', 
            width: 250, 
            height: 250, 
            margin: '0 auto 24px auto',
            borderRadius: '50%',
            border: '2px solid',
            borderColor: 'grey.300',
            backgroundColor: '#fafafa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            
            {/* Cardinal Directions */}
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#d32f2f'
            }}>
              N
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              right: 12, 
              transform: 'translateY(-50%)', 
              color: 'primary.main'
            }}>
              E
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              bottom: 12, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: 'success.main'
            }}>
              S
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: 12, 
              transform: 'translateY(-50%)', 
              color: 'warning.main'
            }}>
              W
            </Typography>

            {/* Simple Degree Markings - Only Main Directions */}
            {[0, 90, 180, 270].map((degree) => (
              <Box
                key={degree}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: 16,
                  backgroundColor: '#d32f2f',
                  transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-115px)`,
                  transformOrigin: 'center 115px'
                }}
              />
            ))}

            {/* Clean Qibla Arrow - Single Direction */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: '40%',
              backgroundColor: '#1976d2',
              transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
              transformOrigin: 'center bottom',
              zIndex: 2,
              borderRadius: '1px',
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
                borderBottom: '10px solid #1976d2'
              }
            }} />

            {/* Center Dot */}
            <Box sx={{
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              width: 12, 
              height: 12,
              backgroundColor: '#d32f2f', 
              borderRadius: '50%', 
              transform: 'translate(-50%, -50%)',
              border: '2px solid white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              zIndex: 3
            }} />

            {/* Current Angle Display */}
            {compassActive && (
              <Box sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'primary.main',
                color: 'white',
                padding: '2px 8px',
                borderRadius: 1,
                fontSize: '0.7rem',
                fontWeight: '500'
              }}>
                {currentAngle.toFixed(0)}°
              </Box>
            )}
          </Box>

          {/* Current Heading Display */}
          {compassActive && (
            <Box sx={{ 
              textAlign: 'center',
              mb: 2,
              p: 1.5,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 1
            }}>
              <Typography variant="body2" fontWeight="500">
                Current Heading: {deviceHeading.toFixed(0)}°
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Rotate device until arrow points to 0°
              </Typography>
            </Box>
          )}

          {/* Simple Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            mb: 2
          }}>
            <Button 
              startIcon={<Refresh />} 
              onClick={getLocation}
              variant="outlined"
              disabled={loading}
              size="medium"
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            
            <Button 
              startIcon={<CompassCalibration />} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "outlined" : "contained"}
              color={compassActive ? "secondary" : "primary"}
              size="medium"
            >
              {compassActive ? 'Stop' : 'Start Compass'}
            </Button>
          </Box>

          {/* Simple Instructions */}
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {!compassActive 
              ? 'Click "Start Compass" to begin. Allow permissions if prompted.'
              : 'The blue arrow points to Mecca. Rotate your device to find the direction.'
            }
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;