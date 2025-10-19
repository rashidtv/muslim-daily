import React from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box
} from '@mui/material';
import {
  CompassCalibration,
  Mosque
} from '@mui/icons-material';

const PrayerResources = () => {
  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Prayer Resources
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Qibla Direction
          </Typography>
          
          {/* Simple Static Compass */}
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
              {/* Qibla Arrow - Fixed Northwest */}
              <Box sx={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                width: 6,
                height: '40%',
                backgroundColor: '#FF0000',
                transform: 'translateX(-50%) rotate(292deg)',
                transformOrigin: 'bottom center'
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
          
          <Typography variant="body1" gutterBottom>
            Face Northwest direction for prayer
          </Typography>

          <Typography variant="caption" color="text.secondary">
            For Malaysia: 292° Northwest towards Mecca
          </Typography>
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