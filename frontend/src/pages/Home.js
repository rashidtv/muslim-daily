import React from 'react';
import { Box, Container, Typography, Card, CardContent, Button, Stack, Grid } from '@mui/material';
import { Link } from 'react-router-dom';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes'; // FIXED IMPORT

const Home = () => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)',
      py: 3
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ 
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0d7e3d 0%, #2ecc71 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            MuslimDaily
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Your Free Daily Practice Companion 🕌
          </Typography>
        </Box>

        {/* Navigation */}
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
          <Button variant="contained" component={Link} to="/">
            Home
          </Button>
          <Button variant="outlined" component={Link} to="/progress">
            Progress
          </Button>
          <Button variant="outlined" component={Link} to="/settings">
            Settings
          </Button>
        </Stack>

        <Grid container spacing={3}>
          {/* Prayer Times */}
          <Grid item xs={12} md={6}>
            <PrayerTimes /> {/* NOW THIS WILL WORK */}
          </Grid>

          {/* Welcome Card */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, mb: 3, height: '100%' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h4" gutterBottom>
                  🎉 Welcome to MuslimDaily!
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Track your daily prayers, Quran reading, and Islamic practices. 
                  Completely free forever!
                </Typography>
                <Typography variant="body2" color="primary.main">
                  Features: Real prayer times, Progress tracking, Achievements
                </Typography>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2">📖</Typography>
                  <Typography variant="h6">Quran Reading</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Daily reading tracker (Coming Soon)
                  </Typography>
                </CardContent>
              </Card>

              <Card sx={{ borderRadius: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="h2">📿</Typography>
                  <Typography variant="h6">Dhikr Counter</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Remember Allah daily (Coming Soon)
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Home;