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
import { Refresh, CheckCircle, RadioButtonUnchecked, MyLocation, GpsFixed, Wifi } from '@mui/icons-material';
import { usePractice } from '../../context/PracticeContext';
import { useAuth } from '../../context/AuthContext';
import { calculatePrayerTimesFromAPI, getCurrentLocation, getNextPrayer } from '../../utils/prayerTimes';

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [usingAPI, setUsingAPI] = useState(true);
  
  const { trackPrayer, getTodayPrayers } = usePractice();
  const { user } = useAuth();

  // Helper function to check if prayer is completed today
  const isPrayerCompletedToday = (prayerName) => {
    if (!user) return false;
    const todayPrayers = getTodayPrayers();
    return todayPrayers.some(prayer => prayer.name.toLowerCase() === prayerName.toLowerCase());
  };

  // Auto-detect location on component mount - USING PRECISE GPS
  const autoDetectLocation = async () => {
    try {
      setLocationLoading(true);
      console.log('📍 Auto-detecting precise location for prayer times...');
      
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      // Calculate prayer times using PRECISE GPS coordinates with JAKIM-like API
      const times = await calculatePrayerTimesFromAPI(location.latitude, location.longitude);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      setUsingAPI(times.source === 'aladhan-api');
      
      setSnackbarMessage(`📍 Using precise location with ${usingAPI ? 'JAKIM-like API' : 'local calculation'}`);
      setSnackbarOpen(true);
      
      console.log('✅ Prayer times calculated:', {
        coordinates: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
        accuracy: `${Math.round(location.accuracy)}m`,
        method: times.method,
        dhuhr: times.dhuhr
      });
      
    } catch (error) {
      console.error('❌ Auto-location failed:', error);
      setError('Unable to detect your location. Using default coordinates.');
      
      // Fallback to Kuala Lumpur coordinates but STILL USE PRECISE CALCULATION
      const fallbackLocation = { latitude: 3.1390, longitude: 101.6869, accuracy: 0, note: 'fallback' };
      setUserLocation(fallbackLocation);
      
      const times = await calculatePrayerTimesFromAPI(fallbackLocation.latitude, fallbackLocation.longitude);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      setUsingAPI(times.source === 'aladhan-api');
      
      setSnackbarMessage('⚠️ Using default location. Enable GPS for precise prayer times.');
      setSnackbarOpen(true);
    } finally {
      setLocationLoading(false);
      setLoading(false);
    }
  };

  // Manual location refresh
  const handleRefreshLocation = async () => {
    setLocationLoading(true);
    try {
      console.log('📍 Manually refreshing precise location...');
      
      const location = await getCurrentLocation();
      setUserLocation(location);
      
      const times = await calculatePrayerTimesFromAPI(location.latitude, location.longitude);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      setUsingAPI(times.source === 'aladhan-api');
      
      setSnackbarMessage(`📍 Location refreshed! Using precise GPS`);
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('❌ Location refresh failed:', error);
      setError('Unable to refresh location. Keeping current prayer times.');
      setSnackbarMessage('❌ Location refresh failed. Please check GPS permissions.');
      setSnackbarOpen(true);
    } finally {
      setLocationLoading(false);
    }
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

  // Auto-detect location on component mount
  useEffect(() => {
    autoDetectLocation();
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
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2, fontSize: '0.9rem' }}>
            {locationLoading ? 'Detecting your precise location...' : 'Calculating prayer times...'}
          </Typography>
          {locationLoading && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
              Using GPS for accurate prayer time calculation
            </Typography>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.25rem' }}>
                <GpsFixed fontSize="small" />
                Prayer Times
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                Calculated using your precise GPS location
              </Typography>
            </Box>
            
            <Button
              size="small"
              startIcon={locationLoading ? <CircularProgress size={16} /> : <MyLocation />}
              onClick={handleRefreshLocation}
              disabled={locationLoading}
              variant="outlined"
              color="primary"
              sx={{ fontSize: '0.8rem', minWidth: '140px' }}
            >
              {locationLoading ? 'Refreshing...' : 'Refresh Location'}
            </Button>
          </Box>

          {error && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

          {!user && (
            <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
              Sign in to track your prayers and view progress
            </Alert>
          )}

          {/* Location Info */}
          {userLocation && (
            <Box sx={{ 
              p: 1.5, 
              borderRadius: 2, 
              mb: 2,
              backgroundColor: usingAPI ? 'info.50' : 'warning.50',
              border: '1px solid',
              borderColor: usingAPI ? 'info.100' : 'warning.100'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {usingAPI ? <Wifi sx={{ fontSize: 16, color: 'info.main' }} /> : <GpsFixed sx={{ fontSize: 16, color: 'warning.main' }} />}
                <Typography variant="body2" color={usingAPI ? 'info.main' : 'warning.main'} fontWeight="medium">
                  {usingAPI ? 'Live JAKIM-like times' : 'Local calculation'} • {userLocation.note === 'fallback' ? 'Default location' : 'Precise GPS'}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                {userLocation.accuracy > 0 && ` • Accuracy: ${Math.round(userLocation.accuracy)}m`}
              </Typography>
            </Box>
          )}

          {/* Next Prayer */}
          {nextPrayer && (
            <Box sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 2, 
              borderRadius: 2, 
              mb: 2,
              textAlign: 'center'
            }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '0.9rem' }}>
                🎯 Next Prayer
              </Typography>
              <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                {nextPrayer.name}
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '0.9rem' }}>
                {nextPrayer.time}
                {nextPrayer.isTomorrow && ' (Tomorrow)'}
              </Typography>
            </Box>
          )}

          {/* Prayer Times List */}
          {prayerTimes && (
            <Grid container spacing={1} sx={{ mb: 1 }}>
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
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isNextPrayer ? 'action.hover' : 'transparent',
                        border: isNextPrayer ? '2px solid' : '1px solid',
                        borderColor: isNextPrayer ? 'primary.main' : 'divider',
                        opacity: isCompleted ? 0.8 : 1,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" sx={{ fontSize: '1.25rem' }}>{prayer.icon}</Typography>
                        <Box>
                          <Typography 
                            variant="body1"
                            fontWeight="600"
                            sx={{ 
                              textDecoration: isCompleted ? 'line-through' : 'none',
                              color: isCompleted ? 'text.secondary' : 'text.primary',
                              fontSize: '0.9rem'
                            }}
                          >
                            {prayer.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            {prayer.time || '--:--'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isNextPrayer && (
                          <Chip 
                            label="Next" 
                            color="primary" 
                            size="small"
                            sx={{ fontSize: '0.65rem', height: '20px' }}
                          />
                        )}
                        
                        <IconButton
                          onClick={() => handlePracticeToggle(prayer.name)}
                          color={isCompleted ? "success" : "default"}
                          size="small"
                          disabled={!user}
                          sx={{
                            border: isCompleted ? '2px solid' : '1px solid',
                            borderColor: isCompleted ? 'success.main' : 'grey.400',
                            width: '32px',
                            height: '32px',
                            opacity: !user ? 0.5 : 1,
                            '&:hover': {
                              backgroundColor: isCompleted ? 'success.50' : 'action.hover'
                            }
                          }}
                          aria-label={!user ? 'Sign in to track prayers' : (isCompleted ? `Mark ${prayer.name} as incomplete` : `Mark ${prayer.name} as completed`)}
                        >
                          {isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Footer Info */}
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {prayerTimes?.method} • Using precise GPS coordinates
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default PrayerTimes;