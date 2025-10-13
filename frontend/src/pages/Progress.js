import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  LinearProgress,
  Chip
} from '@mui/material';
import { usePractice } from '../context/PracticeContext';

const Progress = () => {
  const { todayStats, streak, getWeeklyProgress } = usePractice();
  const weeklyProgress = getWeeklyProgress();

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fdf9 0%, #e8f5e8 100%)',
      py: 3
    }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4 }}>
          📊 Your Progress
        </Typography>
        
        <Grid container spacing={3}>
          {/* Today's Progress */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Today's Progress
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Prayers Completed
                    </Typography>
                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                      {todayStats.prayersCompleted}/5
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={todayStats.progress} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`🔥 ${streak} day streak`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <Chip 
                    label={`${Math.round(todayStats.progress)}% completed`} 
                    color="success" 
                    variant="outlined" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Weekly Progress */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  This Week
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {weeklyProgress.map((day, index) => (
                    <Box key={day.date} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {day.day}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={(day.completed / day.total) * 100} 
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                        {day.completed}/{day.total}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Achievements */}
          <Grid item xs={12}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  🏆 Achievements
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                  Achievement system coming soon! 
                  Track your prayer consistency and earn rewards.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Progress;