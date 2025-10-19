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
  Refresh,
  MyLocation
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Simple Qibla calculation for Malaysia (generally Southeast direction)
  const getQiblaForMalaysia = () => {
    // For Malaysia, Qibla is generally Northwest direction (~292° from North)
    return 292;
  };

  const getUserLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      // Fallback to Malaysia general direction
      setQiblaDirection(getQiblaForMalaysia());
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simple calculation: Malaysia is generally Northwest of Mecca
        // For most locations in Malaysia, Qibla is around 290-300 degrees
        let direction = getQiblaForMalaysia();
        
        // Adjust slightly based on exact location in Malaysia
        if (latitude > 4 && latitude < 6) { // Northern Malaysia
          direction = 295;
        } else if (latitude > 1 && latitude < 3) { // Southern Malaysia
          direction = 290;
        } else { // Central Malaysia
          direction = 292;
        }
        
        setQiblaDirection(direction);
        setLoading(false);
      },
      (error) => {
        // Fallback to general Malaysia direction
        setQiblaDirection(getQiblaForMalaysia());
        setLoading(false);
      },
      {
        enableHighAccuracy: false, // Faster location
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  useEffect(() => {
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
          backgroundColor: '#f8f9fa',
          background: 'conic-gradient(from 0deg, #0D9488, #F59E0B, #0D9488)'
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
            borderRadius: 2,
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
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            position: 'absolute',
            top: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white'
          }}
        >
          N
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            position: 'absolute',
            top: '50%',
            right: '5%',
            transform: 'translateY(-50%)',
            color: 'white'
          }}
        >
          E
        </Typography>
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%)',
            color: 'white'
          }}
        >
          S
        </Text>
        <Typography
          variant="caption"
          fontWeight="bold"
          sx={{
            position: 'absolute',
            top: '50%',
            left: '5%',
            transform: 'translateY(-50%)',
            color: 'white'
          }}
        >
          W
        </Typography>
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

      {/* Qibla Direction */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Qibla Direction
          </Typography>
          
          {loading ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Finding your direction to Mecca...
              </Typography>
            </Box>
          ) : (
            <>
              <Compass direction={qiblaDirection} />
              
              <Typography variant="h4" color="primary.main" gutterBottom>
                {qiblaDirection}°
              </Typography>
              
              <Typography variant="body1" gutterBottom>
                Face Northwest direction for prayer
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                ↖️ Point yourself between North and West
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

      {/* Mosque Finder */}
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Mosque sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mosque Finder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find nearby mosques and prayer facilities
          </Typography>
          
          <Box 
            sx={{ 
              height: 150, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'background.default',
              borderRadius: 1,
              border: `2px dashed`,
              borderColor: 'divider',
              mt: 2
            }}
          >
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