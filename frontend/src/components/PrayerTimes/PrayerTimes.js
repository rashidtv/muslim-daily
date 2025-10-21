import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Button,
  Chip,
  Grid
} from '@mui/material';
import {
  AccessTime,
  Refresh,
  MyLocation,
  WbSunny,
  NightsStay,
  Brightness4
} from '@mui/icons-material';
import { PrayerTimesContext } from '../context/PrayerTimesContext';
import { getSimpleZoneName } from '../utils/locationZones';

const PrayerTimes = () => {
  const { prayerTimes, loading, error, zone, fetchPrayerTimes, userLocation } = useContext(PrayerTimesContext);
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (prayerTimes) {
      setLastUpdated(new Date().toLocaleTimeString());
    }
  }, [prayerTimes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPrayerTimes();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getPrayerIcon = (prayerName) => {
    switch (prayerName.toLowerCase()) {
      case 'fajr':
        return <Brightness4 sx={{ fontSize: 20, color: '#1976d2' }} />;
      case 'sunrise':
        return <WbSunny sx={{ fontSize: 20, color: '#ff9800' }} />;
      case 'dhuhr':
        return <WbSunny sx={{ fontSize: 20, color: '#f57c00' }} />;
      case 'asr':
        return <AccessTime sx={{ fontSize: 20, color: '#388e3c' }} />;
      case 'maghrib':
        return <NightsStay sx={{ fontSize: 20, color: '#d32f2f' }} />;
      case 'isha':
        return <NightsStay sx={{ fontSize: 20, color: '#7b1fa2' }} />;
      default:
        return <AccessTime sx={{ fontSize: 20 }} />;
    }
  };

  const getPrayerColor = (prayerName) => {
    switch (prayerName.toLowerCase()) {
      case 'fajr':
        return '#1976d2';
      case 'sunrise':
        return '#ff9800';
      case 'dhuhr':
        return '#f57c00';
      case 'asr':
        return '#388e3c';
      case 'maghrib':
        return '#d32f2f';
      case 'isha':
        return '#7b1fa2';
      default:
        return 'text.primary';
    }
  };

  const formatPrayerName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const getCurrentPrayer = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Sunrise', time: prayerTimes.sunrise },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    for (let i = prayers.length - 1; i >= 0; i--) {
      const prayerTime = prayers[i].time;
      if (prayerTime) {
        const [time, period] = prayerTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const prayerMinutes = hours * 60 + minutes;
        
        if (currentTime >= prayerMinutes) {
          return prayers[i];
        }
      }
    }
    
    return prayers[prayers.length - 1]; // Return Isha if before Fajr
  };

  const getNextPrayer = () => {
    if (!prayerTimes) return null;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr },
      { name: 'Dhuhr', time: prayerTimes.dhuhr },
      { name: 'Asr', time: prayerTimes.asr },
      { name: 'Maghrib', time: prayerTimes.maghrib },
      { name: 'Isha', time: prayerTimes.isha }
    ];

    for (let i = 0; i < prayers.length; i++) {
      const prayerTime = prayers[i].time;
      if (prayerTime) {
        const [time, period] = prayerTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        
        const prayerMinutes = hours * 60 + minutes;
        
        if (currentTime < prayerMinutes) {
          return prayers[i];
        }
      }
    }
    
    return prayers[0]; // Return Fajr if after Isha
  };

  const currentPrayer = getCurrentPrayer();
  const nextPrayer = getNextPrayer();

  // Get human-readable location name
  const displayLocation = zone ? getSimpleZoneName(zone) : 'Your Location';

  if (loading) {
    return (
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Loading Prayer Times...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button color="inherit" size="small" onClick={fetchPrayerTimes}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!prayerTimes) {
    return (
      <Card elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Prayer Times Not Available
          </Typography>
          <Button 
            variant="contained" 
            onClick={fetchPrayerTimes}
            startIcon={<Refresh />}
          >
            Load Prayer Times
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header with Location and Refresh */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(135deg, #1976d2 0%, #0D47A1 100%)',
          color: 'white',
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MyLocation sx={{ fontSize: 20, mr: 1, opacity: 0.9 }} />
                <Typography variant="h6" fontWeight="600">
                  {displayLocation}
                </Typography>
              </Box>
              {userLocation && (
                <Chip 
                  label="Live Location" 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontSize: '0.7rem'
                  }}
                />
              )}
            </Box>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              startIcon={<Refresh />}
              variant="outlined"
              size="small"
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {refreshing ? 'Updating...' : 'Refresh'}
            </Button>
          </Box>

          {/* Current Prayer Status */}
          {currentPrayer && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                Currently: <strong>{formatPrayerName(currentPrayer.name)}</strong>
              </Typography>
              {nextPrayer && nextPrayer.name !== 'Fajr' && (
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  Next: <strong>{formatPrayerName(nextPrayer.name)}</strong> at {nextPrayer.time}
                </Typography>
              )}
            </Box>
          )}
        </Box>

        {/* Prayer Times Grid */}
        <Box sx={{ p: 3 }}>
          <Grid container spacing={2}>
            {Object.entries(prayerTimes).map(([key, time]) => {
              if (key === 'date' || !time) return null;
              
              const prayerName = formatPrayerName(key);
              const isCurrentPrayer = currentPrayer && currentPrayer.name.toLowerCase() === key.toLowerCase();
              const prayerColor = getPrayerColor(key);
              
              return (
                <Grid item xs={6} sm={4} key={key}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                      border: isCurrentPrayer ? `2px solid ${prayerColor}` : '1px solid',
                      borderColor: isCurrentPrayer ? prayerColor : 'divider',
                      backgroundColor: isCurrentPrayer ? `${prayerColor}10` : 'transparent',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: isCurrentPrayer ? `${prayerColor}15` : 'grey.50'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      {getPrayerIcon(key)}
                    </Box>
                    <Typography 
                      variant="body2" 
                      fontWeight="600" 
                      color={isCurrentPrayer ? prayerColor : 'text.primary'}
                      gutterBottom
                    >
                      {prayerName}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight="700"
                      color={isCurrentPrayer ? prayerColor : 'text.primary'}
                    >
                      {time}
                    </Typography>
                    {isCurrentPrayer && (
                      <Chip 
                        label="Now" 
                        size="small" 
                        sx={{ 
                          mt: 1,
                          backgroundColor: prayerColor,
                          color: 'white',
                          fontSize: '0.6rem',
                          height: 20
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Last Updated */}
          {lastUpdated && (
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default PrayerTimes;