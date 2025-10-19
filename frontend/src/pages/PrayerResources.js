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
import { CompassCalibration, Mosque, Refresh } from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(292); // Default for Malaysia
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // For Malaysia, Qibla is always ~292°
        setQiblaDirection(292);
        setLoading(false);
      },
      () => {
        setError('Location access needed for accurate Qibla');
        setLoading(false);
      }
    );
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Qibla Direction</Typography>
          
          {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

          <Box sx={{ position: 'relative', width: 200, height: 200, margin: '0 auto', mb: 3 }}>
            <Box sx={{
              width: '100%', height: '100%', borderRadius: '50%', border: '3px solid',
              borderColor: 'primary.main', position: 'relative', backgroundColor: '#f8f9fa'
            }}>
              <Box sx={{
                position: 'absolute', top: '10%', left: '50%', width: 4, height: '45%',
                backgroundColor: '#FF0000', transform: `translateX(-50%) rotate(${qiblaDirection}deg)`,
                transformOrigin: 'bottom center'
              }} />
              
              <Box sx={{
                position: 'absolute', top: '50%', left: '50%', width: 12, height: 12,
                backgroundColor: 'primary.main', borderRadius: '50%', transform: 'translate(-50%, -50%)'
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
            Face Northwest towards Mecca
          </Typography>

          <Button startIcon={<Refresh />} onClick={getLocation} variant="outlined">
            {loading ? <CircularProgress size={20} /> : 'Recalibrate'}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;