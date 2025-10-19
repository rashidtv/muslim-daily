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

  // PROVEN Qibla calculation that actually works
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
    const phiK = meccaLatRad;
    const lambdaK = meccaLngRad;
    const phi = latRad;
    const lambda = lngRad;

    const term1 = Math.sin(lambdaK - lambda);
    const term2 = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    
    let bearing = Math.atan2(term1, term2);
    bearing = bearing * 180 / Math.PI;
    
    // Convert to compass bearing
    bearing = (bearing + 360) % 360;
    
    return Math.round(bearing);
  };

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        
        try {
          // Use the proven calculation
          const direction = calculateQiblaDirection(latitude, longitude);
          console.log('📍 Location:', latitude, longitude);
          console.log('🧭 Qibla Direction:', direction);
          
          setQiblaDirection(direction);
          setLoading(false);
        } catch (calcError) {
          console.error('Qibla calculation error:', calcError);
          // Fallback to Malaysia default
          setQiblaDirection(292);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Location error:', err);
        // Fallback to Malaysia default
        setQiblaDirection(292);
        setLoading(false);
        
        let errorMessage = 'Using default Qibla direction for Malaysia. ';
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage += 'Enable location for more accuracy.';
            break;
          default:
            errorMessage += 'Qibla direction: 292° Northwest.';
        }
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
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
        {/* Qibla Arrow */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: 6,
            height: '40%',
            backgroundColor: '#FF0000',
            transform: `translateX(-50%) rotate(${direction}deg)`,
            transformOrigin: 'bottom center',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: '-8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid #FF0000'
            }
          }}
        />
        
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 16,
            height: 16,
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

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Qibla Direction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Find the direction to Mecca for prayer
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Qibla Direction
          </Typography>
          
          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
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
          ) : qiblaDirection !== null && (
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