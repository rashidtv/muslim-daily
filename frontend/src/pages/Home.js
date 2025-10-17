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
  alpha,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  MenuBook,
  Psychology,
  Mosque,
  Notifications,
  PlayArrow
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes';

const Home = ({ onAuthAction }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <AccessTime sx={{ fontSize: { xs: 32, md: 40 }, color: '#2E7D32' }} />,
      title: 'Prayer Times',
      description: 'Accurate prayer times based on your location with automatic detection',
      color: '#E8F5E8'
    },
    {
      icon: <TrendingUp sx={{ fontSize: { xs: 32, md: 40 }, color: '#FF9800' }} />,
      title: 'Progress Tracking',
      description: 'Track your daily prayers and spiritual progress with detailed analytics',
      color: '#FFF3E0'
    },
    {
      icon: <MenuBook sx={{ fontSize: { xs: 32, md: 40 }, color: '#2196F3' }} />,
      title: 'Quran Reading',
      description: 'Track your Quran reading progress with verse-by-verse completion',
      color: '#E3F2FD'
    },
    {
      icon: <Psychology sx={{ fontSize: { xs: 32, md: 40 }, color: '#9C27B0' }} />,
      title: 'Dhikr Counter',
      description: 'Count your daily dhikr and maintain spiritual consistency',
      color: '#F3E5F5'
    }
  ];

  const handleGetStarted = () => {
    if (onAuthAction) {
      onAuthAction('register');
    }
  };

  return (
    <Box sx={{ pb: { xs: 2, md: 0 } }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 4, md: 6 },
        background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
        color: 'white',
        py: { xs: 4, md: 6 },
        borderRadius: { xs: 3, md: 4 },
        position: 'relative',
        overflow: 'hidden',
        mx: { xs: -2, sm: -3, md: 0 }
      }}>
        <Container maxWidth="md">
          <Mosque sx={{ fontSize: { xs: 48, md: 64 }, mb: 2, opacity: 0.9 }} />
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            fontWeight="700" 
            gutterBottom
            sx={{ px: { xs: 1, md: 0 } }}
          >
            Welcome to MuslimDaily
          </Typography>
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            sx={{ opacity: 0.9, mb: 3, px: { xs: 1, md: 0 } }}
          >
            Your companion for daily prayers, Quran reading, and spiritual growth
          </Typography>
          {!user && (
            <Button 
              variant="contained" 
              size={isMobile ? "medium" : "large"}
              endIcon={<PlayArrow />}
              onClick={handleGetStarted}
              sx={{
                backgroundColor: 'white',
                color: '#2E7D32',
                '&:hover': { 
                  backgroundColor: '#f5f5f5',
                  transform: 'translateY(-2px)'
                },
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                transition: 'all 0.3s ease',
                fontWeight: 700
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
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                padding: { xs: 1, md: 2 },
                height: 'auto'
              }}
            />
          )}
        </Container>
      </Box>

      {/* Prayer Times Section */}
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <PrayerTimes />
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg">
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          textAlign="center" 
          fontWeight="700" 
          gutterBottom 
          sx={{ mb: { xs: 3, md: 4 } }}
        >
          Spiritual Features
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card sx={{ 
                height: '100%',
                backgroundColor: feature.color,
                border: 'none',
                borderRadius: 3
              }}>
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: { xs: 3, md: 4 } 
                }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    fontWeight="600" 
                    gutterBottom
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}
                  >
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
        <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
          <Card sx={{ 
            backgroundColor: '#FFF8E1', 
            border: 'none',
            borderRadius: 3
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              p: { xs: 3, md: 4 } 
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight="600" 
                gutterBottom 
                color="#FF9800"
              >
                Today's Progress
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6} md={3}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="700" 
                    color="#2E7D32"
                  >
                    5
                  </Typography>
                  <Typography variant="body2">Prayers</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="700" 
                    color="#2E7D32"
                  >
                    0
                  </Typography>
                  <Typography variant="body2">Quran Pages</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="700" 
                    color="#2E7D32"
                  >
                    0
                  </Typography>
                  <Typography variant="body2">Dhikr Count</Typography>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography 
                    variant={isMobile ? "h5" : "h4"} 
                    fontWeight="700" 
                    color="#2E7D32"
                  >
                    0
                  </Typography>
                  <Typography variant="body2">Day Streak</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}

      {/* Call to Action for Non-Users */}
      {!user && (
        <Container maxWidth="md" sx={{ mt: { xs: 4, md: 6 }, textAlign: 'center' }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
            color: 'white',
            borderRadius: 3,
            py: { xs: 3, md: 4 }
          }}>
            <CardContent>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight="700" 
                gutterBottom
              >
                Start Your Spiritual Journey Today
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ opacity: 0.9, mb: 3 }}
              >
                Join thousands of Muslims using MuslimDaily to enhance their daily practice
              </Typography>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                endIcon={<PlayArrow />}
                onClick={handleGetStarted}
                sx={{
                  backgroundColor: 'white',
                  color: '#2E7D32',
                  '&:hover': { 
                    backgroundColor: '#f5f5f5',
                    transform: 'translateY(-2px)'
                  },
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  transition: 'all 0.3s ease',
                  fontWeight: 700
                }}
              >
                Get Started Free
              </Button>
            </CardContent>
          </Card>
        </Container>
      )}
    </Box>
  );
};

export default Home;