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
  useMediaQuery,
  alpha
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  MenuBook,
  Psychology,
  Mosque,
  PlayArrow,
  Explore,
  SelfImprovement,
  Spa
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes';

const Home = ({ onAuthAction }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <SelfImprovement sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Mindful Practice',
      description: 'Transform your daily prayers into mindful moments with guided reflections',
      gradient: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
      color: '#6366F1'
    },
    {
      icon: <AccessTime sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Intelligent Timing',
      description: 'Smart prayer times that adapt to your location and preferences',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      color: '#F59E0B'
    },
    {
      icon: <MenuBook sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Sacred Journey',
      description: 'Personalized Quran reading plans that grow with your spiritual journey',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      color: '#10B981'
    },
    {
      icon: <Psychology sx={{ fontSize: { xs: 32, md: 40 } }} />,
      title: 'Soul Analytics',
      description: 'Deep insights into your spiritual growth and consistency patterns',
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
      color: '#8B5CF6'
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
        position: 'relative',
        overflow: 'hidden',
        mx: { xs: -2, sm: -3, md: 0 }
      }}>
        {/* Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -100,
            left: -100,
            width: 250,
            height: 250,
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}
        />
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              width: { xs: 80, md: 120 },
              height: { xs: 80, md: 120 },
              background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              boxShadow: '0 20px 60px rgba(99, 102, 241, 0.3)'
            }}
          >
            <Spa sx={{ fontSize: { xs: 40, md: 60 }, color: 'white' }} />
          </Box>
          
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            fontWeight="800" 
            gutterBottom
            sx={{ 
              px: { xs: 1, md: 0 },
              mb: 2
            }}
          >
            Your Sacred Space for
            <Box 
              component="span" 
              sx={{ 
                background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'block'
              }}
            >
              Modern Spirituality
            </Box>
          </Typography>
          
          <Typography 
            variant={isMobile ? "body1" : "h6"} 
            sx={{ 
              color: 'text.secondary', 
              mb: 4, 
              px: { xs: 1, md: 0 },
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.6
            }}
          >
            A thoughtfully designed companion that brings peace, mindfulness, and consistency to your spiritual practice
          </Typography>
          
          {!user && (
            <Button 
              variant="contained" 
              size={isMobile ? "medium" : "large"}
              endIcon={<PlayArrow />}
              onClick={handleGetStarted}
              sx={{
                background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
                '&:hover': { 
                  transform: 'translateY(-3px)',
                  boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
                },
                px: { xs: 4, md: 6 },
                py: { xs: 1.5, md: 2 },
                borderRadius: 3,
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.1rem' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Begin Your Journey
            </Button>
          )}
          {user && (
            <Chip 
              label={`Welcome to your sacred space, ${user.name}`}
              sx={{ 
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%)',
                color: 'text.primary',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                fontSize: { xs: '0.9rem', md: '1rem' },
                padding: { xs: 1, md: 2 },
                height: 'auto',
                fontWeight: 600
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
          fontWeight="800" 
          gutterBottom 
          sx={{ mb: { xs: 3, md: 6 } }}
        >
          Designed for Your Spiritual Growth
        </Typography>
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  background: 'white',
                  border: '1px solid rgba(99, 102, 241, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: feature.gradient,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20
                  }
                }}
              >
                <CardContent sx={{ 
                  textAlign: 'center', 
                  p: { xs: 3, md: 4 },
                  pt: { xs: 4, md: 5 } 
                }}>
                  <Box 
                    sx={{
                      width: 80,
                      height: 80,
                      background: feature.gradient,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 20px',
                      color: 'white'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    fontWeight="700" 
                    gutterBottom
                    sx={{ color: feature.color }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', md: '1rem' },
                      lineHeight: 1.6
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
        <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Pattern */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                borderRadius: '50%'
              }}
            />
            
            <CardContent sx={{ 
              textAlign: 'center', 
              p: { xs: 3, md: 4 },
              position: 'relative',
              zIndex: 1
            }}>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                fontWeight="700" 
                gutterBottom 
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Your Spiritual Journey
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {[
                  { value: '5/5', label: 'Prayers', color: '#10B981' },
                  { value: '12min', label: 'Meditation', color: '#6366F1' },
                  { value: '7d', label: 'Streak', color: '#F59E0B' },
                  { value: '24%', label: 'Growth', color: '#8B5CF6' }
                ].map((stat, index) => (
                  <Grid item xs={6} md={3} key={index}>
                    <Typography 
                      variant={isMobile ? "h5" : "h4"} 
                      fontWeight="800" 
                      sx={{ color: stat.color }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
        <Container maxWidth="md" sx={{ mt: { xs: 4, md: 8 }, textAlign: 'center' }}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(245, 158, 11, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            borderRadius: 3,
            py: { xs: 4, md: 6 },
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                left: -50,
                width: 100,
                height: 100,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                borderRadius: '50%'
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                right: -30,
                width: 80,
                height: 80,
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, transparent 50%)',
                borderRadius: '50%'
              }}
            />
            
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                fontWeight="800" 
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #F59E0B 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Ready to Transform Your Practice?
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  mb: 4,
                  maxWidth: 500,
                  margin: '0 auto',
                  lineHeight: 1.6
                }}
              >
                Join a community of mindful practitioners and discover the peace that comes with consistent spiritual growth
              </Typography>
              <Button 
                variant="contained" 
                size={isMobile ? "medium" : "large"}
                endIcon={<PlayArrow />}
                onClick={handleGetStarted}
                sx={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #818CF8 100%)',
                  boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)',
                  '&:hover': { 
                    transform: 'translateY(-3px)',
                    boxShadow: '0 12px 40px rgba(99, 102, 241, 0.5)',
                  },
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: 3,
                  fontWeight: 700,
                  fontSize: { xs: '1rem', md: '1.1rem' },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                Start Free Journey
              </Button>
            </CardContent>
          </Card>
        </Container>
      )}
    </Box>
  );
};

export default Home;