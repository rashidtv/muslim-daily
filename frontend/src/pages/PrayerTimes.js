import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  CompassCalibration,
  LocationOn,
  TrendingUp,
  CheckCircle,
  Schedule
} from '@mui/icons-material';

const cities = [
  'Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kota Bharu', 
  'Kuching', 'Shah Alam', 'Petaling Jaya', 'Ipoh', 'Malacca'
];

const PrayerTimes = () => {
  const [location, setLocation] = useState('Kuala Lumpur');
  const [qiblaDirection, setQiblaDirection] = useState(0);
  const [prayerProgress, setPrayerProgress] = useState(0);

  // Mock prayer analytics data
  const prayerAnalytics = {
    today: {
      completed: 2,
      total: 5,
      prayers: [
        { name: 'Fajr', completed: true, time: '5:45 AM' },
        { name: 'Dhuhr', completed: true, time: '1:15 PM' },
        { name: 'Asr', completed: false, time: '4:30 PM' },
        { name: 'Maghrib', completed: false, time: '7:05 PM' },
        { name: 'Isha', completed: false, time: '8:20 PM' }
      ]
    },
    weeklyConsistency: 75 // percentage
  };

  useEffect(() => {
    // Calculate today's prayer progress
    const completed = prayerAnalytics.today.prayers.filter(p => p.completed).length;
    const total = prayerAnalytics.today.prayers.length;
    setPrayerProgress((completed / total) * 100);

    // Simulate Qibla direction (replace with real compass API)
    const interval = setInterval(() => {
      setQiblaDirection(prev => (prev + 0.5) % 360);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const PrayerProgressItem = ({ prayer, completed, time }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, p: 1 }}>
      <CheckCircle 
        sx={{ 
          mr: 2, 
          color: completed ? 'success.main' : 'text.disabled',
          fontSize: '1.5rem'
        }} 
      />
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="body1" fontWeight="600">
          {prayer}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {time}
        </Typography>
      </Box>
      <Chip 
        label={completed ? "Completed" : "Pending"} 
        color={completed ? "success" : "default"}
        size="small"
      />
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Prayer Tools
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Qibla direction and prayer tracking
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Qibla Finder */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <CompassCalibration sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Qibla Direction
              </Typography>
              
              {/* Compass Visualization */}
              <Box sx={{ position: 'relative', margin: '0 auto', width: 150, height: 150, mb: 2 }}>
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '3px solid',
                    borderColor: 'primary.main',
                    position: 'relative',
                    background: 'conic-gradient(from 0deg, #0D9488, #F59E0B)'
                  }}
                >
                  {/* Qibla Indicator */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '10%',
                      left: '50%',
                      width: 4,
                      height: '40%',
                      backgroundColor: 'white',
                      transform: `translateX(-50%) rotate(${qiblaDirection}deg)`,
                      transformOrigin: 'bottom center',
                      borderRadius: 2
                    }}
                  />
                  
                  {/* Center dot */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: 12,
                      height: 12,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transform: 'translate(-50%, -50%)',
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                </Box>
              </Box>

              <Typography variant="h6" color="primary.main" gutterBottom>
                {Math.round(qiblaDirection)}°
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Point towards Mecca
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Location Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <LocationOn sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Prayer Location
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select City</InputLabel>
                <Select
                  value={location}
                  label="Select City"
                  onChange={(e) => setLocation(e.target.value)}
                >
                  {cities.map(city => (
                    <MenuItem key={city} value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Alert severity="info">
                Using accurate location for precise prayer times
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Prayer Analytics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6">
                    Today's Prayer Progress
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prayerAnalytics.today.completed} of {prayerAnalytics.today.total} prayers completed
                  </Typography>
                </Box>
              </Box>

              {/* Progress Bar */}
              <LinearProgress 
                variant="determinate" 
                value={prayerProgress} 
                sx={{ height: 8, borderRadius: 4, mb: 3 }}
              />

              {/* Prayer List */}
              <Box>
                {prayerAnalytics.today.prayers.map(prayer => (
                  <PrayerProgressItem
                    key={prayer.name}
                    prayer={prayer.name}
                    completed={prayer.completed}
                    time={prayer.time}
                  />
                ))}
              </Box>

              {/* Weekly Consistency */}
              <Paper 
                sx={{ 
                  p: 2, 
                  mt: 2, 
                  backgroundColor: 'primary.light', 
                  color: 'primary.contrastText',
                  textAlign: 'center'
                }}
              >
                <Typography variant="body2" fontWeight="600">
                  Weekly Consistency: {prayerAnalytics.weeklyConsistency}%
                </Typography>
                <Typography variant="caption">
                  Keep up the good work! 💪
                </Typography>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default PrayerTimes;