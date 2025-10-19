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
  const [qiblaDirection, setQiblaDirection] = useState(292);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);

  // CORRECT Qibla calculation for Malaysia
  const calculateQibla = (lat, lng) => {
    // Mecca coordinates
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const latRad = lat * Math.PI / 180;
    const lngRad = lng * Math.PI / 180;
    const meccaLatRad = meccaLat * Math.PI / 180;
    const meccaLngRad = meccaLng * Math.PI / 180;

    // CORRECT formula - different parameter order
    const y = Math.sin(meccaLngRad - lngRad);
    const x = Math.cos(latRad) * Math.tan(meccaLatRad) - Math.sin(latRad) * Math.cos(meccaLngRad - lngRad);
    
    let qibla = Math.atan2(y, x);
    qibla = qibla * 180 / Math.PI;
    
    // Convert to compass bearing (0-360)
    qibla = (qibla + 360) % 360;
    
    return Math.round(qibla);
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
        setUserLocation({ latitude, longitude });
        
        try {
          // Calculate Qibla
          const direction = calculateQibla(latitude, longitude);
          console.log('📍 Location:', latitude, longitude);
          console.log('🧭 Qibla Direction:', direction);
          
          setQiblaDirection(direction);
          setLoading(false);
        } catch (error) {
          console.error('Calculation error:', error);
          // Fallback to accurate Malaysia default
          setQiblaDirection(292);
          setLoading(false);
        }
      },
      (err) => {
        console.error('Location error:', err);
        // Use accurate Malaysia default
        setQiblaDirection(292);
        setLoading(false);
        setError('Using accurate Qibla direction for Malaysia: 292° Northwest');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000
      }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Qibla Direction
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Accurate direction to Mecca
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Qibla Direction</Typography>
          
          {error && <Alert severity="info" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
            <Box sx={{
              width: '100%', height: '100%', borderRadius: '50%', border: '3px solid',
              borderColor: 'primary.main', position: 'relative', backgroundColor: '#f8f9fa'
            }}>
              {/* Qibla Arrow */}
              <Box sx={{
                position: 'absolute', top: '10%', left: '50%', width: 4, height: '40%',
                backgroundColor: '#FF0000', transform: `translateX(-50%) rotate(${qiblaDirection}deg)`,
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
                position: 'absolute', top: '50%', left: '50%', width: 16, height: 16,
                backgroundColor: 'primary.main', borderRadius: '50%', transform: 'translate(-50%, -50%)',
                border: '2px solid white'
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
          
          <Typography variant="body1" gutterBottom>
            Face this direction towards Mecca
          </Typography>

          {userLocation && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
            </Typography>
          )}

          <Button 
            startIcon={<Refresh />} 
            onClick={getLocation}
            variant="outlined"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Recalibrate'}
          </Button>

          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Expected for Malaysia:</strong> 290°-295° Northwest<br/>
              If direction seems wrong, try recalibrating with better GPS signal
            </Typography>
          </Box>
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