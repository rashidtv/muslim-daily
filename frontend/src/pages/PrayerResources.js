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

  // Get user location for accurate Qibla calculation
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
        calculateQiblaDirection(latitude, longitude);
      },
      (error) => {
        setError('Unable to retrieve your location. Please enable location services.');
        setLoading(false);
      }
    );
  };

  // Calculate Qibla direction based on user location
  const calculateQiblaDirection = (lat, lng) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert degrees to radians
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);
    const meccaLatRad = meccaLat * (Math.PI / 180);
    const meccaLngRad = meccaLng * (Math.PI / 180);

    // Calculate Qibla direction
    const y = Math.sin(meccaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLngRad - lngRad);
    let qibla = Math.atan2(y, x) * (180 / Math.PI);

    // Convert to compass bearing (0° = North, 90° = East, etc.)
    qibla = (qibla + 360) % 360;
    
    setQiblaDirection(Math.round(qibla));
    setLoading(false);
  };

  // Real compass orientation
  useEffect(() => {
    if (!qiblaDirection) return;

    const handleDeviceOrientation = (event) => {
      if (event.alpha !== null) {
        const compass = event.alpha; // 0-360 degrees
        // Adjust Qibla direction based on device orientation
        const adjustedDirection = (qiblaDirection - compass + 360) % 360;
        setQiblaDirection(adjustedDirection);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    return () => {
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, [qiblaDirection]);

  useEffect(() => {
    // Auto-detect location on component mount
    getUserLocation();
  }, []);

  const Compass = ({ direction }) => (
    <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
      {/* Compass Circle */}
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'primary.main',
          position: 'relative',
          background: 'conic-gradient(from 0deg, #0D9488, #F59E0B, #0D9488)'
        }}
      >
        {/* Qibla Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: 4,
            height: '40%',
            backgroundColor: '#FF0000',
            transform: `translateX(-50%) rotate(${direction}deg)`,
            transformOrigin: 'bottom center',
            borderRadius: 2,
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)'
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
            backgroundColor: 'white',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: '2px solid',
            borderColor: 'primary.main',
            zIndex: 2
          }}
        />

        {/* Direction markers */}
        {['N', 'E', 'S', 'W'].map((dir, index) => (
          <Typography
            key={dir}
            variant="caption"
            fontWeight="bold"
            sx={{
              position: 'absolute',
              top: index === 0 ? '5%' : index === 2 ? '85%' : '50%',
              left: index === 1 ? '85%' : index === 3 ? '5%' : '50%',
              transform: 'translate(-50%, -50%)',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            {dir}
          </Typography>
        ))}
      </Box>
    </Box>
  );

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
                    Detecting your location...
                  </Typography>
                </Box>
              ) : qiblaDirection !== null ? (
                <>
                  <Compass direction={qiblaDirection} />
                  
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {qiblaDirection}°
                  </Typography>
                  
                  <Typography variant="body1" gutterBottom>
                    Face this direction for prayer towards Mecca
                  </Typography>

                  {userLocation && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Based on your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </Typography>
                  )}

                  <Button 
                    startIcon={<Refresh />}
                    onClick={getUserLocation}
                    variant="outlined"
                    sx={{ mt: 2 }}
                  >
                    Recalibrate
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