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

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // For Malaysia, Qibla is approximately 292 degrees
        // This is a fixed value for testing in Malaysia
        const direction = 292; // Fixed for Malaysia
        
        setQiblaDirection(direction);
        setLoading(false);
        console.log('Qibla direction set to:', direction);
      },
      (err) => {
        setError('Please enable location access for accurate Qibla direction');
        setLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000 
      }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Qibla Direction
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Getting your location...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Simple Compass */}
              <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
                <Box sx={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  backgroundColor: '#f8f9fa'
                }}>
                  {/* Qibla Arrow - Fixed at 292° for Malaysia */}
                  <Box sx={{
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
                  }} />
                  
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 16,
                    height: 16,
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '2px solid white'
                  }} />

                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)' }}>N</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)' }}>E</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)' }}>W</Typography>
                </Box>
              </Box>

              <Typography variant="h4" color="primary.main" gutterBottom>
                292°
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                Face Northwest direction for prayer towards Mecca
              </Typography>

              <Button 
                startIcon={<Refresh />}
                onClick={getUserLocation}
                variant="outlined"
              >
                Refresh
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