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
        
        // Show only district, city, and state (in that order of preference)
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
        
        // If we have location parts, use them, otherwise use coordinates
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
        elevation={2}
        sx={{
          background: 'white',
          borderRadius: 2,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: { xs: 2, sm: 3 } }}>
          
          {/* Simple Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 3,
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Chip 
              icon={<Navigation />}
              label={compassActive ? "COMPASS ACTIVE" : "ENABLE COMPASS"} 
              color={compassActive ? "success" : "primary"}
              variant="filled"
              size="medium"
              sx={{ fontWeight: 600 }}
            />
            <Typography 
              variant="h5" 
              fontWeight="700" 
              color="primary.main"
              sx={{ 
                fontSize: { xs: '1.25rem', sm: '1.5rem' }
              }}
            >
              QIBLA COMPASS
            </Typography>
          </Box>

          {/* Error Messages */}
          {(error || compassError) && (
            <Alert 
              severity="warning" 
              sx={{ 
                mb: 3,
                borderRadius: 1
              }}
            >
              {error || compassError}
            </Alert>
          )}

          {/* Simple Location Display */}
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
                <MyLocation sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                <Typography variant="body1" color="primary.main" fontWeight="600">
                  Your Location
                </Typography>
              </Box>
              
              <Typography variant="body1" fontWeight="500" gutterBottom>
                {locationName}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Qibla: <strong>{qiblaDirection}°</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  GPS: <strong>Active</strong>
                </Typography>
              </Box>
            </Box>
          )}

          {/* Real Compass Design */}
          <Box sx={{ 
            position: 'relative', 
            width: { xs: 260, sm: 280 }, 
            height: { xs: 260, sm: 280 }, 
            margin: '0 auto 24px auto',
            borderRadius: '50%',
            border: '3px solid #333',
            background: `
              radial-gradient(circle at center, #f8f8f8 0%, #e0e0e0 100%),
              repeating-conic-gradient(from 0deg, #333 0deg 1deg, transparent 1deg 5deg)
            `,
            boxShadow: `
              0 4px 20px rgba(0,0,0,0.15),
              inset 0 2px 4px rgba(255,255,255,0.8),
              inset 0 -2px 4px rgba(0,0,0,0.1)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            
            {/* Cardinal Directions - Real Compass Style */}
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: 12, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#d32f2f',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              N
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              right: 12, 
              transform: 'translateY(-50%)', 
              color: '#1976d2',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              E
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              bottom: 12, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#2e7d32',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              S
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: 12, 
              transform: 'translateY(-50%)', 
              color: '#ed6c02',
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}>
              W
            </Typography>

            {/* Degree Markings */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((degree) => (
              <Box
                key={degree}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: degree % 90 === 0 ? 3 : 1,
                  height: degree % 30 === 0 ? 20 : 12,
                  backgroundColor: degree % 90 === 0 ? '#d32f2f' : '#666',
                  transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-125px)`,
                  transformOrigin: 'center 125px'
                }}
              />
            ))}

            {/* Qibla Arrow - Real Compass Style */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 4,
              height: '42%',
              background: 'linear-gradient(to top, #1976d2 0%, #0D47A1 100%)',
              transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
              transformOrigin: 'center center',
              zIndex: 2,
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '10px solid transparent',
                borderRight: '10px solid transparent',
                borderBottom: '18px solid #0D47A1'
              },
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
                borderTop: '14px solid #1976d2'
              }
            }} />

            {/* Center Pin */}
            <Box sx={{
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              width: 20, 
              height: 20,
              background: 'radial-gradient(circle, #d32f2f 0%, #b71c1c 100%)', 
              borderRadius: '50%', 
              transform: 'translate(-50%, -50%)',
              border: '3px solid white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              zIndex: 3
            }} />

            {/* Direction Indicator */}
            {compassActive && (
              <Box sx={{
                position: 'absolute',
                bottom: 8,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(25, 118, 210, 0.9)',
                color: 'white',
                padding: '4px 12px',
                borderRadius: 12,
                fontSize: '0.75rem',
                fontWeight: '600'
              }}>
                {currentAngle.toFixed(0)}° to Mecca
              </Box>
            )}
          </Box>

          {/* Simple Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            mb: 2
          }}>
            <Button 
              startIcon={<Refresh />} 
              onClick={getLocation}
              variant="outlined"
              disabled={loading}
              size="medium"
              sx={{
                borderRadius: 2,
                minWidth: { xs: '140px', sm: '160px' }
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            
            <Button 
              startIcon={<CompassCalibration />} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "outlined" : "contained"}
              color={compassActive ? "secondary" : "primary"}
              size="medium"
              sx={{
                borderRadius: 2,
                minWidth: { xs: '140px', sm: '160px' }
              }}
            >
              {compassActive ? 'Stop' : 'Start'}
            </Button>
          </Box>

          {/* Current Heading Display */}
          {compassActive && (
            <Box sx={{ 
              textAlign: 'center',
              mb: 2,
              p: 1,
              backgroundColor: 'primary.main',
              color: 'white',
              borderRadius: 2
            }}>
              <Typography variant="body2" fontWeight="600">
                Current Heading: {deviceHeading.toFixed(0)}°
              </Typography>
            </Box>
          )}

          {/* Simple Instructions */}
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {!compassActive 
              ? 'Click "Start" to enable compass. Allow permissions if prompted.'
              : 'Rotate your device until the blue arrow points to 0°. Face that direction for Qibla.'
            }
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;