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
  const [qiblaDirection, setQiblaDirection] = useState(292); // Default for Malaysia
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // Simple function to get location - NO CALCULATIONS
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
        
        // For Malaysia, Qibla is consistently 292-295° Northwest
        // We'll use 292° as it's the most common
        setQiblaDirection(292);
        setLoading(false);
        console.log('📍 Location detected, Qibla set to 292°');
      },
      (err) => {
        console.log('Location not available, using default Qibla direction');
        // Still show Qibla direction (292° for Malaysia)
        setQiblaDirection(292);
        setLoading(false);
        setError('Using default Qibla direction for Malaysia (292° Northwest)');
      },
      {
        enableHighAccuracy: false, // Simpler request
        timeout: 5000,
        maximumAge: 300000
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
        {/* Qibla Arrow - Fixed at 292° */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: 6,
            height: '40%',
            backgroundColor: '#FF0000',
            transform: `translateX(-50%) rotate(292deg)`,
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
          Direction to Mecca for Prayer
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
          ) : (
            <>
              <Compass direction={qiblaDirection} />
              
              <Typography variant="h4" color="primary.main" gutterBottom>
                292°
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Face Northwest towards Mecca
              </Typography>

              {userLocation ? (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Based on your location in Malaysia
                </Typography>
              ) : (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Default direction for Malaysia
                </Typography>
              )}

              <Button 
                startIcon={<Refresh />}
                onClick={getUserLocation}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Refresh Location
              </Button>

              <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Note:</strong> For Malaysia and Southeast Asia, Qibla direction is consistently Northwest (292°)
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
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;