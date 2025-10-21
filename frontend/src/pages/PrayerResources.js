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
  Paper
} from '@mui/material';
import {
  Explore,
  Refresh,
  Navigation,
  Place,
  MyLocation,
  Mosque
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
      <Card 
        elevation={3}
        sx={{
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: 3,
          overflow: 'visible'
        }}
      >
        <CardContent sx={{ textAlign: 'center', p: 4, position: 'relative' }}>
          
          {/* Header with Mosque Icon */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            mb: 3,
            position: 'relative'
          }}>
            <Box sx={{
              position: 'absolute',
              left: 0,
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <Chip 
                icon={<Navigation />}
                label={compassActive ? "ACTIVE" : "READY"} 
                color={compassActive ? "success" : "primary"}
                variant="filled"
                size="small"
              />
            </Box>
            
            <Mosque sx={{ 
              fontSize: 40, 
              color: 'primary.main',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
            }} />
            
            <Typography 
              variant="h4" 
              fontWeight="800" 
              sx={{ 
                ml: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #0D47A1 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'warning.light'
              }}
            >
              {error || compassError}
            </Alert>
          )}

          {/* Location Card */}
          {userLocation && (
            <Paper 
              elevation={1}
              sx={{ 
                mb: 4, 
                p: 2.5, 
                borderRadius: 3,
                background: 'white',
                border: '1px solid',
                borderColor: 'divider',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #1976d2 0%, #0D47A1 100%)'
              }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <MyLocation sx={{ 
                  fontSize: 24, 
                  color: 'primary.main',
                  mr: 1.5 
                }} />
                <Typography variant="h6" color="primary.main" fontWeight="600">
                  Current Location
                </Typography>
              </Box>
              
              <Typography variant="body1" fontWeight="500" gutterBottom>
                {locationName || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1.5
              }}>
                <Typography variant="caption" color="text.secondary">
                  Qibla Direction: <strong>{qiblaDirection}°</strong>
                </Typography>
                <Chip 
                  label="GPS Active" 
                  size="small" 
                  color="success" 
                  variant="outlined"
                />
              </Box>
            </Paper>
          )}

          {/* Compass Container - PERFECTLY CENTERED ARROW */}
          <Box sx={{ 
            position: 'relative', 
            width: 280, 
            height: 280, 
            margin: '0 auto 40px auto',
            borderRadius: '50%',
            border: '4px solid',
            borderColor: compassActive ? '#4CAF50' : '#BDBDBD',
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            boxShadow: `
              0 8px 32px rgba(0,0,0,0.1),
              inset 0 2px 4px rgba(255,255,255,0.8),
              inset 0 -2px 4px rgba(0,0,0,0.1)
            `,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s ease'
          }}>
            
            {/* Compass Degree Markings */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((degree) => (
              <Box
                key={degree}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: 2,
                  height: degree % 90 === 0 ? 20 : 12,
                  backgroundColor: degree % 90 === 0 ? '#d32f2f' : '#757575',
                  transform: `translate(-50%, -50%) rotate(${degree}deg) translateY(-125px)`,
                  transformOrigin: 'center 125px'
                }}
              />
            ))}

            {/* Compass Directions */}
            <Typography variant="h6" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: 16, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#d32f2f',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              N
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              right: 16, 
              transform: 'translateY(-50%)', 
              color: '#1976d2' 
            }}>
              E
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              bottom: 16, 
              left: '50%', 
              transform: 'translateX(-50%)', 
              color: '#2e7d32' 
            }}>
              S
            </Typography>
            <Typography variant="body1" fontWeight="bold" sx={{ 
              position: 'absolute', 
              top: '50%', 
              left: 16, 
              transform: 'translateY(-50%)', 
              color: '#ed6c02' 
            }}>
              W
            </Typography>

            {/* Qibla Arrow - PERFECTLY CENTERED */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 3,
              height: '45%', // Extends from center to near edge
              backgroundColor: compassActive ? '#1976d2' : '#90caf9',
              // PERFECT CENTERING: Transform from exact center
              transform: `translate(-50%, -50%) rotate(${currentAngle}deg)`,
              transformOrigin: 'center center', // Rotate from exact center
              zIndex: 2,
              borderRadius: '2px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0, // Triangle at the outer end
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: `16px solid ${compassActive ? '#1976d2' : '#90caf9'}` // Points outward
              }
            }} />

            {/* Center Pin - Larger and more prominent */}
            <Box sx={{
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              width: 24, 
              height: 24,
              background: 'radial-gradient(circle, #d32f2f 0%, #b71c1c 100%)', 
              borderRadius: '50%', 
              transform: 'translate(-50%, -50%)',
              border: '4px solid white',
              boxShadow: `
                0 4px 12px rgba(0,0,0,0.3),
                inset 0 2px 4px rgba(255,255,255,0.5)
              `,
              zIndex: 3
            }} />

            {/* Mecca Indicator */}
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 12,
              height: 12,
              backgroundColor: '#2e7d32',
              borderRadius: '50%',
              transform: `translate(-50%, -50%) translate(0, -120px) rotate(${currentAngle}deg)`,
              transformOrigin: 'center 120px',
              zIndex: 1,
              boxShadow: '0 2px 8px rgba(46,125,50,0.5)',
              border: '2px solid white'
            }} />
          </Box>

          {/* Direction Information */}
          {qiblaDirection !== null && (
            <Paper 
              elevation={2}
              sx={{ 
                mb: 4, 
                p: 3, 
                borderRadius: 3,
                background: 'linear-gradient(135deg, #1976d2 0%, #0D47A1 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ 
                position: 'absolute',
                top: 0,
                right: 0,
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%',
                transform: 'translate(30px, -30px)'
              }} />
              
              <Typography variant="h2" fontWeight="800" gutterBottom sx={{ opacity: 0.9 }}>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                {compassActive 
                  ? `Point towards Mecca (${currentAngle.toFixed(0)}°)` 
                  : `Face ${qiblaDirection}° from North`
                }
              </Typography>
              
              {compassActive && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Current device heading: <strong>{deviceHeading.toFixed(0)}°</strong>
                </Typography>
              )}
            </Paper>
          )}

          {/* Controls */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            flexWrap: 'wrap' 
          }}>
            <Button 
              startIcon={<Refresh />} 
              onClick={getLocation}
              variant="outlined"
              disabled={loading}
              size="large"
              sx={{
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2
                }
              }}
            >
              {loading ? <CircularProgress size={24} /> : 'Refresh Location'}
            </Button>
            
            <Button 
              startIcon={<Navigation />} 
              onClick={compassActive ? stopCompass : startCompass}
              variant={compassActive ? "outlined" : "contained"}
              color={compassActive ? "secondary" : "primary"}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                background: compassActive ? '' : 'linear-gradient(135deg, #1976d2 0%, #0D47A1 100%)',
                borderWidth: compassActive ? 2 : 0,
                '&:hover': {
                  borderWidth: compassActive ? 2 : 0
                }
              }}
            >
              {compassActive ? 'Stop Compass' : 'Start Compass'}
            </Button>
          </Box>

          {/* Instructions */}
          <Paper 
            elevation={1}
            sx={{ 
              mt: 3, 
              p: 2.5, 
              borderRadius: 2,
              background: 'rgba(25, 118, 210, 0.05)',
              border: '1px solid',
              borderColor: 'primary.light'
            }}
          >
            <Typography variant="body2" textAlign="center" color="text.secondary">
              <strong>How to use:</strong> {!compassActive 
                ? 'Click "Start Compass" and allow permissions. On iOS, you may need to allow compass access in settings.'
                : 'Rotate your device until the blue arrow points straight up (0°). You will then be facing Mecca.'
              }
            </Typography>
          </Paper>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;