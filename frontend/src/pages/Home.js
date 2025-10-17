import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Container,
  Chip,
  alpha
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  MenuBook,
  Psychology,
  Mosque,
  Notifications
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <AccessTime sx={{ fontSize: 40, color: '#2E7D32' }} />,
      title: 'Prayer Times',
      description: 'Accurate prayer times based on your location with automatic detection',
      color: '#E8F5E8'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40, color: '#FF9800' }} />,
      title: 'Progress Tracking',
      description: 'Track your daily prayers and spiritual progress with detailed analytics',
      color: '#FFF3E0'
    },
    {
      icon: <MenuBook sx={{ fontSize: 40, color: '#2196F3' }} />,
      title: 'Quran Reading',
      description: 'Track your Quran reading progress with verse-by-verse completion',
      color: '#E3F2FD'
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#9C27B0' }} />,
      title: 'Dhikr Counter',
      description: 'Count your daily dhikr and maintain spiritual consistency',
      color: '#F3E5F5'
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 6,
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        py: 6,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="md">
          <Mosque sx={{ fontSize: 64, mb: 2, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight="700" gutterBottom>
            Welcome to MuslimDaily
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
            Your companion for daily prayers, Quran reading, and spiritual growth
          </Typography>
          {!user && (
            <Button 
              variant="contained" 
              size="large"
              sx={{
                backgroundColor: 'white',
                color: '#2E7D32',
                '&:hover': { backgroundColor: '#f5f5f5' },
                px: 4,
                py: 1.5
              }}
            >
              Get Started
            </Button>
          )}
          {user && (
            <Chip 
              label={`Welcome back, ${user.name}!`}
              sx={{ 
                backgroundColor: 'white', 
                color: '#2E7D32',
                fontSize: '1.1rem',
                padding: 2
              }}
            />
          )}
        </Container>
      </Box>

      {/* Prayer Times Section */}
      <Box sx={{ mb: 6 }}>
        <PrayerTimes />
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg">
        <Typography variant="h4" textAlign="center" fontWeight="700" gutterBottom sx={{ mb: 4 }}>
          Spiritual Features
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: feature.color,
                border: 'none'
              }}>
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" fontWeight="600" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      {user && (
        <Container maxWidth="lg" sx={{ mt: 6 }}>
          <Card sx={{ backgroundColor: '#FFF8E1', border: 'none' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Typography variant="h5" fontWeight="600" gutterBottom color="#FF9800">
                Today's Progress
              </Typography>
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4" fontWeight="700" color="#2E7D32">5</Typography>
                  <Typography variant="body2">Prayers</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4" fontWeight="700" color="#2E7D32">0</Typography>
                  <Typography variant="body2">Quran Pages</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4" fontWeight="700" color="#2E7D32">0</Typography>
                  <Typography variant="body2">Dhikr Count</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h4" fontWeight="700" color="#2E7D32">0</Typography>
                  <Typography variant="body2">Day Streak</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}
    </Box>
  );
};

export default Home;