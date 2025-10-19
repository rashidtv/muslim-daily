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

  // Simple and accurate Qibla calculation
  const calculateQiblaDirection = (lat, lng) => {
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const meccaLatRad = meccaLat * Math.PI / 180;
    const meccaLngRad = meccaLng * Math.PI / 180;

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
      setError('Geolocation not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // For Malaysia, Qibla should be around 292-295 degrees
        const direction = calculateQiblaDirection(latitude, longitude);
        console.log('Qibla Direction Calculated:', direction);
        
        setQiblaDirection(direction);
        setLoading(false);
      },
      (err) => {
        setError('Location access required for Qibla direction');
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
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
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
                  {/* Qibla Arrow - Points TOWARD Mecca */}
                  <Box sx={{
                    position: 'absolute',
                    top: '10%',
                    left: '50%',
                    width: 6,
                    height: '40%',
                    backgroundColor: '#FF0000',
                    transform: `translateX(-50%) rotate(${qiblaDirection}deg)`,
                    transformOrigin: 'bottom center',
                    borderRadius: '3px',
                    boxShadow: '0 0 8px rgba(255,0,0,0.6)',
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
                  
                  {/* Center dot */}
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: 16,
                    height: 16,
                    backgroundColor: 'primary.main',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    border: '3px solid white'
                  }} />

                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)' }}>N</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', right: '5%', transform: 'translateY(-50%)' }}>E</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}>S</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ position: 'absolute', top: '50%', left: '5%', transform: 'translateY(-50%)' }}>W</Typography>
                </Box>
              </Box>

              <Typography variant="h4" color="primary.main" gutterBottom>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3 }}>
                Face this direction for prayer towards Mecca
              </Typography>

              <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                Expected direction for Malaysia: 292°-295° (Northwest)
              </Typography>

              <Button 
                startIcon={<Refresh />}
                onClick={getUserLocation}
                variant="outlined"
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