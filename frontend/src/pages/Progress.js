import React from 'react';
import { Container, Typography, Card, CardContent } from '@mui/material';

const Progress = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        My Progress
      </Typography>
      <Card>
        <CardContent>
          <Typography>Progress tracking page coming soon...</Typography>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Progress;