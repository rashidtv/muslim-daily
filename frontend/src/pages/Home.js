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
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  AccessTime,
  TrendingUp,
  MenuBook,
  Psychology,
  PlayArrow,
  CheckCircle,
  Chat,
  CalendarMonth,
  LocationOn,
  Notifications,
  SelfImprovement
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import PrayerTimes from '../components/PrayerTimes/PrayerTimes';

const Home = ({ onAuthAction }) => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const uniqueFeatures = [
    {
      icon: <Chat sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'WhatsApp Reminders',
      description: 'Get prayer times & daily Quran directly on WhatsApp',
      benefit: 'No app opening needed'
    },
    {
      icon: <CalendarMonth sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Daily Planning',
      description: 'Schedule your spiritual tasks alongside daily activities',
      benefit: 'Better time management'
    },
    {
      icon: <SelfImprovement sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Mindful Moments',
      description: 'Pause and reflect with guided Islamic reflections',
      benefit: 'Reduce morning rush'
    },
    {
      icon: <LocationOn sx={{ fontSize: { xs: 20, md: 24 } }} />,
      title: 'Mosque Finder',
      description: 'Find nearest prayers and community events',
      benefit: 'Stay connected'
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
              backgroundColor: 'rgba(13, 148, 136, 0.1)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              border: '2px solid rgba(13, 148, 136, 0.2)'
            }}
          >
            <MenuBook sx={{ fontSize: { xs: 32, md: 42 }, color: '#0D9488' }} />
          </Box>
          
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            fontWeight="700" 
            gutterBottom
            sx={{ mb: 1 }}
          >
            Your Peaceful Daily
            <Box 
              component="span" 
              sx={{ color: '#F59E0B', display: 'block' }}
            >
              Muslim Diary
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
            Move beyond the rush. Mindful reminders, WhatsApp notifications, and daily planning for a peaceful spiritual journey.
          </Typography>
          
          {!user && (
            <Button 
              variant="contained" 
              size={isMobile ? "medium" : "large"}
              endIcon={<PlayArrow />}
              onClick={handleGetStarted}
              sx={{
                backgroundColor: '#0D9488',
                '&:hover': {
                  backgroundColor: '#0F766E',
                },
                px: { xs: 3, md: 4 },
                py: { xs: 1, md: 1.5 },
                borderRadius: 2,
                fontWeight: 600,
              }}
            >
              Start Your Peaceful Journey
            </Button>
          )}
        </Container>
      </Box>

      {/* Prayer Times Section */}
      <Box sx={{ mb: { xs: 3, md: 4 } }}>
        <PrayerTimes />
      </Box>

      {/* Unique Value Proposition */}
      <Container maxWidth="lg" sx={{ mb: { xs: 3, md: 4 } }}>
        <Card sx={{ backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 3 } }}>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              fontWeight="600" 
              gutterBottom
              color="#F59E0B"
            >
              Tired of the Morning Rush?
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ color: 'text.secondary', mb: 2 }}
            >
              Most apps add to your busy schedule. Muslim Diary helps you slow down and be present.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
              {['Mindful Reminders', 'WhatsApp Integration', 'Daily Planning', 'Focus on Presence'].map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  size="small"
                  sx={{ 
                    backgroundColor: 'white',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Unique Features */}
      <Container maxWidth="lg">
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          textAlign="center" 
          fontWeight="600" 
          gutterBottom 
          sx={{ mb: { xs: 2, md: 3 } }}
        >
          Designed for Modern Muslim Life
        </Typography>
        <Grid container spacing={2}>
          {uniqueFeatures.map((feature, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: 'rgba(13, 148, 136, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2,
                        color: '#0D9488',
                        flexShrink: 0
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {feature.description}
                      </Typography>
                      <Chip 
                        label={feature.benefit} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: '#F59E0B',
                          color: '#F59E0B',
                          fontSize: '0.7rem'
                        }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* WhatsApp Integration Highlight */}
      <Container maxWidth="md" sx={{ mt: { xs: 3, md: 4 } }}>
        <Card sx={{ 
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Chat sx={{ fontSize: { xs: 40, md: 48 }, mb: 2 }} />
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="600" gutterBottom>
              Reminders on WhatsApp
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
              Get prayer times, daily Quran verses, and spiritual reminders directly in WhatsApp. No need to open the app constantly.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
              {['Prayer Times', 'Quran Verses', 'Hadith', 'Mosque Events'].map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  size="small"
                  sx={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* Daily Planning Preview */}
      {!user && (
        <Container maxWidth="lg" sx={{ mt: { xs: 3, md: 4 } }}>
          <Card sx={{ backgroundColor: 'rgba(13, 148, 136, 0.05)' }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarMonth sx={{ color: '#0D9488', mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600">
                  Your Spiritual Day at a Glance
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Plan your day with spiritual tasks integrated into your schedule:
                  </Typography>
                  <List dense>
                    {['Morning Dhikr', 'Quran Reading', 'Prayer Times', 'Evening Reflection'].map((item, index) => (
                      <ListItem key={index} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircle sx={{ fontSize: 16, color: '#0D9488' }} />
                        </ListItemIcon>
                        <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center', pt: { xs: 2, md: 0 } }}>
                    <Button 
                      variant="contained"
                      onClick={handleGetStarted}
                      sx={{
                        backgroundColor: '#0D9488',
                        '&:hover': { backgroundColor: '#0F766E' },
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Start Planning Today
                    </Button>
                  </Box>
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