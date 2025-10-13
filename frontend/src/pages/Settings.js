import React from 'react';
import { Box, Container, Typography, Card, CardContent } from '@mui/material';

const Settings = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)',
      py: 3
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom>
          ⚙️ Settings
        </Typography>
        
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>
              App Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Location, notifications, and preferences coming soon!
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Settings;