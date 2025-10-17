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
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  MenuBook,
  Psychology,
  Mosque,
  PlayArrow,
  Star,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes';

const Home = ({ onAuthAction }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <AccessTime sx={{ fontSize: { xs: 24, md: 32 } }} />,
      title: 'Prayer Times',
      description: 'Accurate prayer times with notifications',
      color: '#1A4F8C'
    },
    {
      icon: <MenuBook sx={{ fontSize: { xs: 24, md: 32 } }} />,
      title: 'Quran Journey',
      description: 'Track your Quran reading progress',
      color: '#D4AF37'
    },
    {
      icon: <TrendingUp sx={{ fontSize: { xs: 24, md: 32 } }} />,
      title: 'Progress Tracking',
      description: 'Monitor your spiritual growth',
      color: '#0D9488'
    },
    {
      icon: <Psychology sx={{ fontSize: { xs: 24, md: 32 } }} />,
      title: 'Dhikr Counter',
      description: 'Count your daily remembrance',
      color: '#7C3AED'
    }
  ];

  const handleGetStarted = () => {
    if (onAuthAction) {
      onAuthAction('register');
    }
  };

  return (
    <Box sx={{ pb: { xs: 1, md: 0 } }}>
      {/* Hero Section */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: { xs: 3, md: 4 },
        pt: { xs: 1, md: 2 }
      }}>
        <Container maxWidth="md">
          <Box
            sx={{
              width: { xs: 70, md: 90 },
              height: { xs: 70, md: 90 },
              backgroundColor: 'rgba(26, 79, 140, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid rgba(26, 79, 140, 0.2)'
            }}
          >
            <Mosque sx={{ fontSize: { xs: 32, md: 42 }, color: '#1A4F8C' }} />
          </Box>
          
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="700" 
            gutterBottom
            sx={{ mb: 1 }}
          >
            Welcome to Muslim
            <Box 
              component="span" 
              sx={{ color: '#D4AF37' }}
            >
              Journal
            </Box>
          </Typography>
          
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ 
              color: 'text.secondary', 
              mb: 3,
              maxWidth: 500,
              margin: '0 auto',
              lineHeight: 1.5
            }}
          >
            Your personal companion for tracking prayers, Quran reading, and spiritual growth
          </Typography>
          
          {!user && (
            <Button 
              variant="contained" 
              size={isMobile ? "medium" : "large"}
              endIcon={<PlayArrow />}
              onClick={handleGetStarted}
              sx={{
                backgroundColor: '#1A4F8C',
                '&:hover': {
                  backgroundColor: '#0D3A6A',
                },
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Start Your Journey
            </Button>
          )}
          {user && (
            <Chip 
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label={`Welcome back, ${user.name}`}
              sx={{ 
                backgroundColor: 'rgba(26, 79, 140, 0.08)',
                color: '#1A4F8C',
                border: '1px solid rgba(26, 79, 140, 0.2)',
                fontSize: { xs: '0.8rem', md: '0.9rem' },
                padding: { xs: 1, md: 1.5 },
                height: 'auto',
                fontWeight: 500
              }}
            />
          )}
        </Container>
      </Box>

      {/* Prayer Times Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <PrayerTimes />
      </Box>

      {/* Features Grid */}
      <Container maxWidth="lg">
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          textAlign="center" 
          fontWeight="600" 
          gutterBottom 
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          Your Spiritual Companion
        </Typography>
        <Grid container spacing={2}>
          {features.map((feature, index) => (
            <Grid item xs={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  backgroundColor: 'background.paper',
                  textAlign: 'center',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  },
                  transition: 'transform 0.2s ease'
                }}
              >
                <CardContent sx={{ p: '0 !important' }}>
                  <Box 
                    sx={{
                      width: 50,
                      height: 50,
                      backgroundColor: 'rgba(26, 79, 140, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px',
                      color: feature.color
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="600" 
                    gutterBottom
                    sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.75rem', md: '0.8rem' },
                      lineHeight: 1.4
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section for Users */}
      {user && (
        <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 4 } }}>
          <Card sx={{ 
            backgroundColor: 'rgba(26, 79, 140, 0.03)',
            border: '1px solid rgba(26, 79, 140, 0.1)',
            borderRadius: 2,
          }}>
            <CardContent sx={{ 
              textAlign: 'center', 
              p: { xs: 2, md: 3 },
            }}>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                fontWeight="600" 
                gutterBottom 
                color="#1A4F8C"
              >
                Today's Progress
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.5 }}>
                {[
                  { value: '5/5', label: 'Prayers', color: '#1A4F8C' },
                  { value: '3p', label: 'Quran', color: '#D4AF37' },
                  { value: '45', label: 'Dhikr', color: '#0D9488' },
                  { value: '7d', label: 'Streak', color: '#7C3AED' }
                ].map((stat, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      fontWeight="700" 
                      sx={{ color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}

      {/* Call to Action for Non-Users */}
      {!user && (
        <Container maxWidth="sm" sx={{ mt: { xs: 3, md: 4 }, textAlign: 'center' }}>
          <Card sx={{ 
            backgroundColor: 'rgba(26, 79, 140, 0.05)',
            border: '1px solid rgba(26, 79, 140, 0.1)',
            borderRadius: 2,
            py: { xs: 2, md: 3 },
          }}>
            <CardContent>
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                fontWeight="600" 
                gutterBottom
                color="#1A4F8C"
              >
                Start Your Spiritual Journey
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ color: 'text.secondary', mb: 2 }}
              >
                Join Muslims worldwide in building consistent spiritual habits
              </Typography>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                endIcon={<PlayArrow />}
                onClick={handleGetStarted}
                sx={{
                  backgroundColor: '#1A4F8C',
                  '&:hover': {
                    backgroundColor: '#0D3A6A',
                  },
                  px: { xs: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  borderRadius: 2,
                  fontWeight: 600,
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