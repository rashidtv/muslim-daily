import { CalculationMethod, PrayerTimes, Coordinates, Madhab } from 'adhan';

// Malaysia calculation parameters - using precise coordinates
const getCalculationParams = () => {
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi;
  params.fajrAngle = 20;
  params.ishaAngle = 18;
  return params;
};

// Format time to 12-hour format
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Calculate prayer times for given coordinates - USING PRECISE GPS
export const calculatePrayerTimes = (latitude, longitude, date = new Date()) => {
  try {
    console.log(`📍 Calculating prayer times for EXACT location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    const coordinates = new Coordinates(latitude, longitude);
    const params = getCalculationParams();
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    const result = {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Muslim World League - Precise GPS',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };

    console.log('✅ Prayer times calculated using PRECISE GPS coordinates');
    console.log('🕌 Calculated Times:', {
      fajr: result.fajr,
      dhuhr: result.dhuhr, 
      asr: result.asr,
      maghrib: result.maghrib,
      isha: result.isha
    });
    
    return result;
  } catch (error) {
    console.error('Prayer time calculation error:', error);
    // Fallback - but still use the exact coordinates
    return calculateWithSimpleParams(latitude, longitude, date);
  }
};

// Alternative calculation
const calculateWithSimpleParams = (latitude, longitude, date = new Date()) => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Muslim World League - Simple',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };
  } catch (error) {
    console.error('Simple calculation failed:', error);
    return getFallbackTimes(latitude, longitude);
  }
};

// Fallback that still shows the actual coordinates
const getFallbackTimes = (latitude, longitude) => {
  const now = new Date();
  console.log(`⚠️ Using fallback times but keeping exact location: ${latitude}, ${longitude}`);
  
  return {
    fajr: '5:45 AM',
    sunrise: '7:10 AM',
    dhuhr: '1:15 PM',
    asr: '4:30 PM',
    maghrib: '7:05 PM',
    isha: '8:20 PM',
    method: 'Fallback (Using exact location)',
    location: { latitude, longitude },
    date: now.toDateString(),
    calculated: false,
    success: true,
    note: 'Using approximate times but your exact location is recorded'
  };
};

// USE THE SAME LOCATION LOGIC AS QIBLA COMPASS
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => { 
    if (!navigator.geolocation) {
      console.warn('📍 Geolocation not supported');
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('📍 Getting PRECISE location for prayer times (same as Qibla)...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log('📍 PRECISE Location for Prayer Times:', {
          lat: location.latitude,
          lng: location.longitude,
          accuracy: `${location.accuracy}m`
        });
        
        resolve(location);
      },
      (error) => {
        console.error('📍 Location error:', error);
        reject(error);
      },
      {
        enableHighAccuracy: true, // SAME AS QIBLA - HIGH ACCURACY
        timeout: 15000, // SAME AS QIBLA
        maximumAge: 600000 // SAME AS QIBLA - 10 minutes
      }
    );
  });
};

// Keep your existing getNextPrayer and getCurrentPrayer functions
export const getNextPrayer = (prayerTimes) => {
  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr },
    { name: 'Dhuhr', time: prayerTimes.dhuhr },
    { name: 'Asr', time: prayerTimes.asr },
    { name: 'Maghrib', time: prayerTimes.maghrib },
    { name: 'Isha', time: prayerTimes.isha }
  ];

  for (let prayer of prayers) {
    const prayerTime = parseTimeString(prayer.time);
    
    if (prayerTime > now) {
      return {
        name: prayer.name,
        time: prayer.time,
        timeObject: prayerTime
      };
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const fajrTime = parseTimeString(prayerTimes.fajr);
  tomorrow.setHours(fajrTime.getHours(), fajrTime.getMinutes(), 0, 0);
  
  return {
    name: 'Fajr',
    time: prayerTimes.fajr,
    timeObject: tomorrow,
    isTomorrow: true
  };
};

export const getCurrentPrayer = (prayerTimes) => {
  const now = new Date();
  const prayers = [
    { name: 'Fajr', time: prayerTimes.fajr, end: prayerTimes.sunrise },
    { name: 'Dhuhr', time: prayerTimes.dhuhr, end: prayerTimes.asr },
    { name: 'Asr', time: prayerTimes.asr, end: prayerTimes.maghrib },
    { name: 'Maghrib', time: prayerTimes.maghrib, end: prayerTimes.isha },
    { name: 'Isha', time: prayerTimes.isha }
  ];

  for (let i = 0; i < prayers.length; i++) {
    const prayer = prayers[i];
    const prayerTime = parseTimeString(prayer.time);
    
    if (prayer.end) {
      const endTime = parseTimeString(prayer.end);
      if (now >= prayerTime && now < endTime) {
        return prayer.name;
      }
    } else {
      const maghribTime = parseTimeString(prayerTimes.maghrib);
      if (now >= maghribTime) {
        return prayer.name;
      }
    }
  }

  return null;
};

const parseTimeString = (timeStr) => {
  const [time, modifier] = timeStr.split(' ');
  let [hours, minutes] = time.split(':');
  
  hours = parseInt(hours);
  minutes = parseInt(minutes);
  
  if (modifier === 'PM' && hours < 12) hours += 12;
  if (modifier === 'AM' && hours === 12) hours = 0;
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

// REMOVED ALL ZONING CODE - using precise coordinates only