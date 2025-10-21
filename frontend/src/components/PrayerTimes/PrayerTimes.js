import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
  Grid
} from '@mui/material';
import { Refresh, CheckCircle, RadioButtonUnchecked, MyLocation } from '@mui/icons-material'; // REMOVED PrayerTimes import
import { usePractice } from '../../context/PracticeContext';
import { useAuth } from '../../context/AuthContext';
import { calculatePrayerTimes, getCurrentLocation, getNextPrayer } from '../../utils/prayerTimes';

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { trackPrayer, getTodayPrayers } = usePractice();
  const { user } = useAuth();

  // Helper function to check if prayer is completed today
  const isPrayerCompletedToday = (prayerName) => {
    if (!user) return false;
    const todayPrayers = getTodayPrayers();
    return todayPrayers.some(prayer => prayer.name.toLowerCase() === prayerName.toLowerCase());
  };

  // Load prayer times from cache or get new ones
  const loadPrayerTimes = async (forceRefresh = false) => {
    // Check if we already have recent prayer times (less than 30 minutes old)
    const cachedPrayerTimes = localStorage.getItem('cachedPrayerTimes');
    const cachedLocation = localStorage.getItem('cachedLocation');
    const cacheTimestamp = localStorage.getItem('prayerTimesTimestamp');
    
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;
    
    if (!forceRefresh && cachedPrayerTimes && cachedLocation && cacheTimestamp && 
        (now - parseInt(cacheTimestamp)) < thirtyMinutes) {
      
      const times = JSON.parse(cachedPrayerTimes);
      const location = JSON.parse(cachedLocation);
      
      setPrayerTimes(times);
      setUserLocation(location);
      setNextPrayer(getNextPrayer(times));
      setLoading(false);
      console.log('✅ Using cached prayer times');
      return;
    }

    // Get new prayer times
    setLocationLoading(true);
    try {
      console.log('📍 Getting fresh prayer times...');
      
      const currentLocation = await getCurrentLocation();
      setUserLocation(currentLocation);
      
      const times = await calculatePrayerTimes(currentLocation.latitude, currentLocation.longitude);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      
      // Cache the results
      localStorage.setItem('cachedPrayerTimes', JSON.stringify(times));
      localStorage.setItem('cachedLocation', JSON.stringify(currentLocation));
      localStorage.setItem('prayerTimesTimestamp', now.toString());
      
      if (forceRefresh) {
        setSnackbarMessage('📍 Location and prayer times updated');
        setSnackbarOpen(true);
      }
      
    } catch (error) {
      console.error('❌ Location failed:', error);
      setError('Unable to detect location. Using cached times.');
      
      // Try to use cached data even if it's old
      if (cachedPrayerTimes && cachedLocation) {
        const times = JSON.parse(cachedPrayerTimes);
        const location = JSON.parse(cachedLocation);
        
        setPrayerTimes(times);
        setUserLocation({ ...location, note: 'cached' });
        setNextPrayer(getNextPrayer(times));
        setSnackbarMessage('⚠️ Using cached prayer times');
        setSnackbarOpen(true);
      }
    } finally {
      setLocationLoading(false);
      setLoading(false);
    }
  };

  // Manual location refresh
  const handleRefreshLocation = async () => {
    await loadPrayerTimes(true);
  };

  const handlePracticeToggle = async (prayerName) => {
    if (!user) {
      setSnackbarMessage('Please sign in to track prayers');
      setSnackbarOpen(true);
      return;
    }

    try {
      const wasCompleted = isPrayerCompletedToday(prayerName);
      await trackPrayer(prayerName);
      
      if (wasCompleted) {
        setSnackbarMessage(`${prayerName} prayer marked as incomplete`);
      } else {
        setSnackbarMessage(`${prayerName} prayer tracked successfully!`);
      }
      
      setSnackbarOpen(true);
      
      // Refresh the UI to show updated completion status
      setPrayerTimes(prev => ({ ...prev }));
    } catch (error) {
      setSnackbarMessage('Failed to track prayer');
      setSnackbarOpen(true);
    }
  };

  // Load prayer times on component mount (only once)
  useEffect(() => {
    setLoading(true);
    loadPrayerTimes();
  }, []);

  const prayers = [
    { name: 'Fajr', time: prayerTimes?.fajr, icon: '🌅', type: 'fajr' },
    { name: 'Dhuhr', time: prayerTimes?.dhuhr, icon: '☀️', type: 'dhuhr' },
    { name: 'Asr', time: prayerTimes?.asr, icon: '🌇', type: 'asr' },
    { name: 'Maghrib', time: prayerTimes?.maghrib, icon: '🌆', type: 'maghrib' },
    { name: 'Isha', time: prayerTimes?.isha, icon: '🌙', type: 'isha' }
  ];

  if (loading && !prayerTimes) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress size={24} />
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.8rem' }}>
            Loading prayer times...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
        <CardContent sx={{ p: 2 }}>
          {/* Compact Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* CHANGED: Using mosque emoji instead of non-existent icon */}
              <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>🕌</Typography>
              <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: '600' }}>
                Prayer Times
              </Typography>
            </Box>
            
            <Button
              size="small"
              startIcon={locationLoading ? <CircularProgress size={14} /> : <MyLocation />}
              onClick={handleRefreshLocation}
              disabled={locationLoading}
              variant="outlined"
              color="primary"
              sx={{ 
                fontSize: '0.7rem', 
                minWidth: 'auto',
                px: 1,
                py: 0.5
              }}
            >
              {locationLoading ? '' : 'Refresh'}
            </Button>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 1.5, fontSize: '0.75rem', py: 0.5 }}>
              {error}
            </Alert>
          )}

          {/* Next Prayer - Compact */}
          {nextPrayer && (
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 1.5, 
              mb: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body2" fontWeight="medium" sx={{ fontSize: '0.8rem' }}>
                Next: {nextPrayer.name}
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1rem' }}>
                {nextPrayer.time}
                {nextPrayer.isTomorrow && ' (Tomorrow)'}
              </Typography>
            </Box>
          )}

          {/* Compact Prayer Times List */}
          {prayerTimes && (
            <Grid container spacing={0.5}>
              {prayers.map((prayer) => {
                const isCompleted = isPrayerCompletedToday(prayer.name);
                const isNextPrayer = nextPrayer?.name === prayer.name;
                
                return (
                  <Grid item xs={12} key={prayer.name}>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 1,
                        bgcolor: isNextPrayer ? 'action.hover' : 'transparent',
                        border: isNextPrayer ? '1px solid' : 'none',
                        borderColor: isNextPrayer ? 'primary.main' : 'transparent',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '1rem', minWidth: '24px' }}>
                          {prayer.icon}
                        </Typography>
                        <Box>
                          <Typography 
                            variant="body2"
                            fontWeight="500"
                            sx={{ 
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              color: isCompleted ? 'text.secondary' : 'text.primary',
                              fontSize: '0.8rem'
                            }}
                          >
                            {prayer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {prayer.time || '--:--'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton
                        onClick={() => handlePracticeToggle(prayer.name)}
                        color={isCompleted ? "success" : "default"}
                        size="small"
                        disabled={!user}
                        sx={{
                          width: '28px',
                          height: '28px',
                          opacity: !user ? 0.5 : 1,
                        }}
                      >
                        {isCompleted ? <CheckCircle fontSize="small" /> : <RadioButtonUnchecked fontSize="small" />}
                      </IconButton>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Compact Footer */}
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
              {prayerTimes?.zone ? `Zone: ${prayerTimes.zone}` : 'Official JAKIM times'}
              {userLocation?.note === 'cached' && ' • Cached'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ '& .MuiSnackbarContent-root': { fontSize: '0.8rem' } }}
      />
    </>
  );
};

export default PrayerTimes;