import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  CompassCalibration,
  Mosque,
  Refresh,
  MyLocation,
  Navigation,
  GpsFixed,
  GpsNotFixed
} from '@mui/icons-material';

const PrayerResources = () => {
  const [qiblaDirection, setQiblaDirection] = useState(null);
  const [deviceHeading, setDeviceHeading] = useState(null);
  const [adjustedQibla, setAdjustedQibla] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [recalibrating, setRecalibrating] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [compassSupported, setCompassSupported] = useState(false);
  
  const watchIdRef = useRef(null);
  const compassIdRef = useRef(null);

  // FIXED Qibla calculation using correct formula
  const calculateQiblaDirection = (lat, lng) => {
    // Mecca coordinates (Kaaba)
    const meccaLat = 21.4225;
    const meccaLng = 39.8262;

    // Convert to radians
    const phiK = meccaLat * Math.PI / 180.0;
    const lambdaK = meccaLng * Math.PI / 180.0;
    const phi = lat * Math.PI / 180.0;
    const lambda = lng * Math.PI / 180.0;

    // Calculate Qibla direction using spherical trigonometry
    const term1 = Math.sin(lambdaK - lambda);
    const term2 = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);
    const psi = 180.0 / Math.PI * Math.atan2(term1, term2);

    // Normalize to 0-360 degrees
    return (psi + 360.0) % 360.0;
  };

  // Calculate relative Qibla direction based on device orientation
  const calculateRelativeQibla = (qiblaDirection, deviceHeading) => {
    if (qiblaDirection === null || deviceHeading === null) return null;
    
    // Calculate the relative angle between device heading and Qibla direction
    let relativeAngle = qiblaDirection - deviceHeading;
    
    // Normalize to 0-360 degrees
    if (relativeAngle < 0) {
      relativeAngle += 360;
    }
    if (relativeAngle >= 360) {
      relativeAngle -= 360;
    }
    
    return relativeAngle;
  };

  // Get device compass heading
  const startCompass = () => {
    if (!window.DeviceOrientationEvent) {
      console.log('Device orientation not supported');
      setCompassSupported(false);
      return;
    }

    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      // iOS 13+ devices
      DeviceOrientationEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation);
            setCompassSupported(true);
          } else {
            setError('Compass permission denied. Please enable device orientation in settings.');
            setCompassSupported(false);
          }
        })
        .catch(console.error);
    } else {
      // Android and older iOS
      window.addEventListener('deviceorientation', handleDeviceOrientation);
      setCompassSupported(true);
    }
  };

  const handleDeviceOrientation = (event) => {
    if (event.alpha !== null) {
      // Use alpha (compass heading) when available
      setDeviceHeading(event.alpha);
    } else if (event.webkitCompassHeading) {
      // iOS Safari
      setDeviceHeading(event.webkitCompassHeading);
    }
  };

  // Start/stop location tracking
  const toggleTracking = () => {
    if (tracking) {
      stopTracking();
    } else {
      startTracking();
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setTracking(true);
    
    // Watch position for continuous updates
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Location updated:', { latitude, longitude, accuracy });
        
        setUserLocation({ latitude, longitude, accuracy });
        
        try {
          // Recalculate Qibla direction with new position
          const direction = calculateQiblaDirection(latitude, longitude);
          console.log('🧭 Updated Qibla direction:', direction);
          
          setQiblaDirection(Math.round(direction));
        } catch (calcError) {
          console.error('Calculation error:', calcError);
        }
      },
      (err) => {
        console.error('Location tracking error:', err);
        setError('Location tracking failed. Please check permissions.');
        setTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
  };

  const getUserLocation = (isRecalibrating = false) => {
    if (isRecalibrating) {
      setRecalibrating(true);
    } else {
      setLoading(true);
    }
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      setRecalibrating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        console.log('📍 Location obtained:', { latitude, longitude, accuracy });
        
        setUserLocation({ latitude, longitude, accuracy });
        
        try {
          const direction = calculateQiblaDirection(latitude, longitude);
          console.log('🧭 Calculated Qibla direction:', direction);
          
          setQiblaDirection(Math.round(direction));
          
          if (isRecalibrating) {
            setRecalibrating(false);
          } else {
            setLoading(false);
          }
        } catch (calcError) {
          console.error('Calculation error:', calcError);
          setError('Error calculating Qibla direction. Please try again.');
          setLoading(false);
          setRecalibrating(false);
        }
      },
      (err) => {
        console.error('Location error:', err);
        let errorMessage = 'Could not get your location. ';
        
        switch (err.code) {
          case err.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable. Please check your device location services.';
            break;
          case err.TIMEOUT:
            errorMessage = 'Location request timed out. Please ensure you have good GPS signal.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please try again.';
        }
        
        setError(errorMessage);
        setLoading(false);
        setRecalibrating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Initialize compass and location
  useEffect(() => {
    getUserLocation();
    startCompass();

    return () => {
      // Cleanup
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
    };
  }, []);

  // Update relative Qibla direction when device heading or Qibla direction changes
  useEffect(() => {
    if (qiblaDirection !== null && deviceHeading !== null) {
      const relative = calculateRelativeQibla(qiblaDirection, deviceHeading);
      setAdjustedQibla(relative);
    }
  }, [qiblaDirection, deviceHeading]);

  const Compass = ({ direction, deviceHeading, showRelative }) => (
    <Box sx={{ position: 'relative', width: 220, height: 220, margin: '0 auto', mb: 3 }}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          border: '3px solid',
          borderColor: 'primary.main',
          position: 'relative',
          backgroundColor: '#f8f9fa',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transform: showRelative ? `rotate(${-deviceHeading}deg)` : 'none',
          transition: showRelative ? 'transform 0.1s ease' : 'none'
        }}
      >
        {/* Qibla Indicator - RED arrow pointing to Mecca */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '50%',
            width: 6,
            height: '45%',
            backgroundColor: '#d32f2f',
            transform: `translateX(-50%) rotate(${showRelative ? 0 : direction}deg)`,
            transformOrigin: 'bottom center',
            borderRadius: '3px 3px 0 0',
            boxShadow: '0 2px 8px rgba(211, 47, 47, 0.6)',
            zIndex: 2,
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '12px solid #d32f2f'
            }
          }}
        />
        
        {/* Device orientation indicator (only in relative mode) */}
        {showRelative && (
          <Box
            sx={{
              position: 'absolute',
              top: '5%',
              left: '50%',
              width: 4,
              height: '20%',
              backgroundColor: '#1976d2',
              transform: 'translateX(-50%)',
              transformOrigin: 'bottom center',
              borderRadius: '2px',
              zIndex: 1
            }}
          />
        )}
        
        {/* Center dot */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 16,
            height: 16,
            backgroundColor: 'primary.main',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            border: '3px solid white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            zIndex: 3
          }}
        />

        {/* Direction markers */}
        <Typography variant="caption" fontWeight="bold" sx={{ 
          position: 'absolute', 
          top: '2%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: '0.75rem',
          transform: showRelative ? 'none' : 'translateX(-50%)'
        }}>N</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ 
          position: 'absolute', 
          top: '50%', 
          right: '2%', 
          transform: 'translateY(-50%)', 
          fontSize: '0.75rem',
          transform: showRelative ? 'none' : 'translateY(-50%)'
        }}>E</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ 
          position: 'absolute', 
          bottom: '2%', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          fontSize: '0.75rem',
          transform: showRelative ? 'none' : 'translateX(-50%)'
        }}>S</Typography>
        <Typography variant="caption" fontWeight="bold" sx={{ 
          position: 'absolute', 
          top: '50%', 
          left: '2%', 
          transform: 'translateY(-50%)', 
          fontSize: '0.75rem',
          transform: showRelative ? 'none' : 'translateY(-50%)'
        }}>W</Typography>

        {/* Degree markers */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <Box
            key={deg}
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 2,
              height: deg % 90 === 0 ? 12 : 6,
              backgroundColor: deg % 90 === 0 ? 'primary.main' : 'text.secondary',
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-95px)`,
              transformOrigin: 'bottom center'
            }}
          />
        ))}
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 3, pb: { xs: 10, md: 3 } }}>
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <CompassCalibration sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" fontWeight="700" gutterBottom>
          Prayer Resources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time Qibla direction and mosque finder
        </Typography>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Qibla Direction
          </Typography>
          
          {error && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Status Indicators */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={compassSupported ? <Navigation /> : <GpsNotFixed />}
              label={compassSupported ? "Compass Active" : "No Compass"}
              color={compassSupported ? "success" : "default"}
              size="small"
            />
            <Chip 
              icon={tracking ? <GpsFixed /> : <GpsNotFixed />}
              label={tracking ? "Live Tracking" : "Static"}
              color={tracking ? "primary" : "default"}
              size="small"
            />
          </Box>

          {(loading || recalibrating) ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {recalibrating ? 'Recalibrating...' : 'Getting your location...'}
              </Typography>
            </Box>
          ) : qiblaDirection !== null ? (
            <>
              <Compass 
                direction={qiblaDirection} 
                deviceHeading={deviceHeading}
                showRelative={compassSupported}
              />
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {compassSupported && adjustedQibla !== null ? adjustedQibla.toFixed(1) : qiblaDirection}°
                </Typography>
                
                <Typography variant="body1" gutterBottom sx={{ mb: 1 }}>
                  {compassSupported 
                    ? `Point ${adjustedQibla !== null ? adjustedQibla.toFixed(1) : '0'}° from your current direction`
                    : 'Face this direction for prayer towards Mecca'
                  }
                </Typography>

                {compassSupported && deviceHeading !== null && (
                  <Typography variant="caption" color="text.secondary">
                    Device heading: {deviceHeading.toFixed(1)}°
                  </Typography>
                )}
              </Box>

              {userLocation && (
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  📍 Location: {userLocation.latitude.toFixed(4)}°, {userLocation.longitude.toFixed(4)}°
                  {userLocation.accuracy && ` (Accuracy: ±${Math.round(userLocation.accuracy)}m)`}
                </Typography>
              )}

              {/* Controls */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={tracking}
                      onChange={toggleTracking}
                      color="primary"
                    />
                  }
                  label="Live Location Tracking"
                />
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Button 
                    startIcon={<Refresh />}
                    onClick={() => getUserLocation(true)}
                    variant="outlined"
                    disabled={recalibrating || tracking}
                  >
                    {recalibrating ? 'Recalibrating...' : 'Recalibrate'}
                  </Button>
                  <Button 
                    startIcon={<MyLocation />}
                    onClick={() => getUserLocation(true)}
                    variant="contained"
                    disabled={recalibrating}
                  >
                    Update Location
                  </Button>
                </Box>
              </Box>

              {/* Instructions */}
              <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  <strong>Usage Tips:</strong><br/>
                  • Enable <strong>Live Location Tracking</strong> for continuous updates while moving<br/>
                  • Hold your device flat and rotate slowly for accurate compass reading<br/>
                  • Ensure location services and device orientation are enabled<br/>
                  • For best accuracy, be outdoors with clear sky view
                </Typography>
              </Box>
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Mosque sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Mosque Finder
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Find nearby mosques and prayer facilities
          </Typography>
          
          <Box sx={{ height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default', borderRadius: 1, border: '2px dashed', borderColor: 'divider', mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Coming Soon
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PrayerResources;