import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

const Settings = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        Settings
      </Typography>
      <Card>
        <CardContent>
          <Typography>Settings page coming soon...</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Settings;