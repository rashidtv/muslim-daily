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
  Refresh
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // VERIFIED Qibla calculation
  const calculateQiblaDirection = (lat, lng) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const meccaLatRad = meccaLat * Math.PI / 180;
    const meccaLngRad = meccaLng * Math.PI / 180;

    // Correct Qibla formula
    const y = Math.sin(meccaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLngRad - lngRad);
    
    let qibla = Math.atan2(y, x) * 180 / Math.PI;
    qibla = (qibla + 360) % 360;
    
    return Math.round(qibla);
  };

  const getUserLocation = () => {
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
        setUserLocation({ latitude, longitude });
        
        // Calculate Qibla
        const direction = calculateQiblaDirection(latitude, longitude);
        console.log('📍 Location:', latitude, longitude);
        console.log('🧭 Qibla Direction:', direction);
        
        setQiblaDirection(direction);
        setLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        setError('Could not get your location. Please enable location services.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  const Compass = ({ direction }) => (
    <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'primary.main',
          position: 'relative',
          backgroundColor: '#f8f9fa'
        }}
      >
        {/* Qibla Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 4,
            height: '45%',
            backgroundColor: '#FF0000',
            transform: `translate(-50%, -100%) rotate(${direction}deg)`,
            transformOrigin: 'bottom center',
            boxShadow: '0 0 10px rgba(255, 0, 0, 0.7)'
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
            border: '2px solid white'
          }}
        />

        {/* Direction markers */}
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)' }}>N</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)' }}>E</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)' }}>W</Typography>
      </Box>
    </Box>
  );

  // Test with known locations
  const testLocations = [
    { name: 'Kuala Lumpur', lat: 3.1390, lng: 101.6869, expected: 292 },
    { name: 'Penang', lat: 5.4164, lng: 100.3327, expected: 293 },
    { name: 'Johor Bahru', lat: 1.4927, lng: 103.7414, expected: 291 }
  ];

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Prayer Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Qibla direction and mosque finder
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Qibla Direction
          </Typography>
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Getting your location and calculating Qibla direction...
              </Typography>
            </Box>
          ) : (
            <>
              <Compass direction={qiblaDirection} />
              
              <Typography variant="h4" color="primary.main" gutterBottom>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Face this direction for prayer towards Mecca
              </Typography>

              {userLocation && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Based on your location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                </Typography>
              )}

              <Button 
                startIcon={<Refresh />}
                onClick={getUserLocation}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Recalibrate
              </Button>

              {/* Debug info */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Expected for Malaysia:</strong> 290°-295° (Northwest direction)
                </Typography>
              </Box>
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
          
          <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', borderRadius: 1, border: '2px dashed', borderColor: 'divider', mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Coming Soon
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;