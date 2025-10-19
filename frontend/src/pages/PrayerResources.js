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

  // Accurate Qibla calculation for any location
  const calculateQibla = (lat, lng) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const phiK = (meccaLat * Math.PI) / 180.0;
    const lambdaK = (meccaLng * Math.PI) / 180.0;
    const phi = (lat * Math.PI) / 180.0;
    const lambda = (lng * Math.PI) / 180.0;

    // Calculate Qibla direction
    const psi = (180.0 / Math.PI) * Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );

    return (psi + 360.0) % 360.0;
  };

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation not supported. Using default Malaysia direction.');
      setQiblaDirection(292); // Default for Malaysia
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);
        
        const direction = calculateQibla(latitude, longitude);
        console.log('Calculated Qibla:', direction);
        
        setQiblaDirection(Math.round(direction));
        setLoading(false);
      },
      (locationError) => {
        console.error('Location error:', locationError);
        setError('Could not get location. Using default direction.');
        setQiblaDirection(292); // Fallback for Malaysia
        setLoading(false);
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
        {/* Qibla Indicator */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 3,
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
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', color: 'text.primary' }}>N</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)', color: 'text.primary' }}>E</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)', color: 'text.primary' }}>S</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)', color: 'text.primary' }}>W</Typography>
      </Box>
    </Box>
  );

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
                Calculating direction to Mecca...
              </Typography>
            </Box>
          ) : (
            <>
              <Compass direction={qiblaDirection} />
              
              <Typography variant="h4" color="primary.main" gutterBottom>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Face this direction for prayer
              </Typography>

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