import React from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  TrendingUp,
  AccessTime
} from '@mui/icons-material';
import { usePractice } from '../context/PracticeContext';
import { useAuth } from '../context/AuthContext';

const Progress = () => {
  const { todayStats, isPracticeCompleted } = usePractice();
  const { user } = useAuth();

  const prayers = [
    { name: 'Fajr', type: 'fajr', icon: '🌅' },
    { name: 'Dhuhr', type: 'dhuhr', icon: '☀️' },
    { name: 'Asr', type: 'asr', icon: '🌇' },
    { name: 'Maghrib', type: 'maghrib', icon: '🌆' },
    { name: 'Isha', type: 'isha', icon: '🌙' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" fontWeight="700" gutterBottom>
        My Progress
      </Typography>
      
      {/* Today's Overview */}
      <Card sx={{ mb: 3, backgroundColor: 'rgba(13, 148, 136, 0.05)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TrendingUp sx={{ color: '#0D9488', mr: 1.5 }} />
            <Typography variant="h6" fontWeight="600" color="#0D9488">
              Today's Overview
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="700" color="#0D9488">
                  {todayStats.prayersCompleted}/5
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Prayers Completed
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="700" color="#F59E0B">
                  {todayStats.quranPages}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Quran Pages
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="700" color="#8B5CF6">
                  {todayStats.dhikrCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Dhikr Count
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box textAlign="center">
                <Typography variant="h4" fontWeight="700" color="#10B981">
                  {Math.round(todayStats.progress)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Daily Progress
                </Typography>
              </Box>
            </Grid>
          </Grid>
          
          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Prayer Progress
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight="bold">
                {todayStats.prayersCompleted}/5
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={todayStats.progress} 
              sx={{ 
                height: 8, 
                borderRadius: 4,
                backgroundColor: 'grey.200',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#0D9488',
                  borderRadius: 4
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Prayer Progress */}
      <Card>
        <CardContent>
          <Typography variant="h6" fontWeight="600" gutterBottom>
            Today's Prayers
          </Typography>
          <Grid container spacing={1}>
            {prayers.map((prayer) => {
              const isCompleted = isPracticeCompleted(prayer.type);
              
              return (
                <Grid item xs={12} key={prayer.type}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid #E2E8F0',
                      backgroundColor: isCompleted ? 'rgba(13, 148, 136, 0.05)' : 'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="h5">{prayer.icon}</Typography>
                      <Typography 
                        variant="body1"
                        fontWeight="600"
                        sx={{ 
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? 'text.secondary' : 'text.primary'
                        }}
                      >
                        {prayer.name}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      icon={isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                      label={isCompleted ? 'Completed' : 'Pending'}
                      color={isCompleted ? 'success' : 'default'}
                      variant={isCompleted ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Progress;