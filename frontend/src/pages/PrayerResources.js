import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
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
  LocationOn,
  Mosque,
  Refresh
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [compassHeading, setCompassHeading] = useState(0);

  // Correct Qibla calculation function
  const calculateQiblaDirection = (lat, lng) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const meccaLatRad = (meccaLat * Math.PI) / 180;
    const meccaLngRad = (meccaLng * Math.PI) / 180;

    // Calculate the direction
    const y = Math.sin(meccaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLngRad - lngRad);
    
    let qibla = Math.atan2(y, x);
    qibla = (qibla * 180) / Math.PI;
    qibla = (qibla + 360) % 360;

    return Math.round(qibla);
  };

  // Get user location
  const getUserLocation = () => {
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
        
        // Calculate Qibla direction
        const direction = calculateQiblaDirection(latitude, longitude);
        setQiblaDirection(direction);
        setLoading(false);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle device compass
  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      console.log('Device orientation not supported');
      return;
    }

    const handleOrientation = (event) => {
      if (event.alpha !== null) {
        // alpha: compass direction the device is facing (0-360)
        setCompassHeading(event.alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  // Auto-detect location on component mount
  useEffect(() => {
    getUserLocation();
  }, []);

  const Compass = ({ direction, heading }) => (
    <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
      {/* Compass Base */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'primary.main',
          position: 'relative',
          backgroundColor: 'background.paper',
          transform: `rotate(${-heading}deg)`, // Rotate compass base against device rotation
          transition: 'transform 0.1s ease'
        }}
      >
        {/* Qibla Indicator - fixed position relative to Mecca */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 2,
            height: '45%',
            backgroundColor: '#FF0000',
            transform: `translate(-50%, -100%) rotate(${direction}deg)`,
            transformOrigin: 'bottom center',
            borderRadius: 1,
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.7)',
            zIndex: 2
          }}
        />

        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 12,
            height: 12,
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid white',
            zIndex: 3
          }}
        />

        {/* Direction markers */}
        {[0, 90, 180, 270].map((angle, index) => {
          const labels = ['N', 'E', 'S', 'W'];
          return (
            <Typography
              key={angle}
              variant="caption"
              fontWeight="bold"
              sx={{
                position: 'absolute',
                top: angle === 0 ? '5%' : angle === 180 ? '85%' : '50%',
                left: angle === 90 ? '85%' : angle === 270 ? '5%' : '50%',
                transform: 'translate(-50%, -50%)',
                color: 'text.primary'
              }}
            >
              {labels[index]}
            </Typography>
          );
        })}
      </Box>
    </Box>
  );

  // Calculate the relative Qibla direction considering device orientation
  const relativeQiblaDirection = qiblaDirection !== null 
    ? (qiblaDirection - compassHeading + 360) % 360
    : 0;

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Prayer Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Qibla direction and mosque finder
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Qibla Direction Finder */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Qibla Direction
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {loading ? (
                <Box sx={{ py: 4 }}>
                  <CircularProgress size={40} />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Detecting your location and calibrating compass...
                  </Typography>
                </Box>
              ) : qiblaDirection !== null ? (
                <>
                  <Compass direction={relativeQiblaDirection} heading={compassHeading} />
                  
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {Math.round(relativeQiblaDirection)}°
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    Face this direction for prayer towards Mecca
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    📱 Point your device forward and rotate to align the red line
                  </Typography>

                  <Button 
                    startIcon={<Refresh />}
                    onClick={getUserLocation}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Recalibrate Location
                  </Button>
                </>
              ) : (
                <Button 
                  startIcon={<CompassCalibration />}
                  onClick={getUserLocation}
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Find Qibla Direction
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mosque Finder - Coming Soon */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Mosque sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Mosque Finder
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Find nearby mosques and prayer facilities
              </Typography>
              
              <Box 
                sx={{ 
                  height: 200, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'background.default',
                  borderRadius: 1,
                  border: `2px dashed`,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1" color="text.secondary">
                    Mosque Finder Coming Soon
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Find prayer spaces near you
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PrayerResources;