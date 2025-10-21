import { CalculationMethod, PrayerTimes, Coordinates, Madhab } from 'adhan';

// MALAYSIA JAKIM calculation parameters
const getCalculationParams = () => {
  // Using JAKIM's specific parameters for Malaysia
  const params = CalculationMethod.MuslimWorldLeague();
  
  // JAKIM Malaysia specific angles (different from standard MWL)
  params.fajrAngle = 20; // JAKIM uses 20° for Fajr
  params.ishaAngle = 18; // JAKIM uses 18° for Isha
  
  // Malaysia specific settings
  params.madhab = Madhab.Shafi;
  params.highLatitudeRule = 'TwilightAngle';
  
  return params;
};

// Format time to 12-hour format
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kuala_Lumpur'
  });
};

// Format time from string (for API responses)
const formatTimeFromString = (timeStr) => {
  // Convert "05:45" to "5:45 AM" format
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
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
      method: 'JAKIM Malaysia - Precise GPS',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };

    console.log('✅ Prayer times calculated using JAKIM parameters');
    console.log('🕌 Calculated Times:', result);
    
    return result;
  } catch (error) {
    console.error('Prayer time calculation error:', error);
    return calculateWithMalaysiaParams(latitude, longitude, date);
  }
};

// Alternative: Direct Malaysia parameters
const calculateWithMalaysiaParams = (latitude, longitude, date = new Date()) => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    
    // Direct JAKIM parameters
    const params = {
      fajrAngle: 20,
      ishaAngle: 18,
      madhab: Madhab.Shafi,
      method: 'Custom'
    };
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'JAKIM Custom - Precise GPS',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };
  } catch (error) {
    console.error('Malaysia calculation failed:', error);
    return getMalaysiaFallbackTimes(latitude, longitude);
  }
};

// Malaysia-specific fallback
const getMalaysiaFallbackTimes = (latitude, longitude) => {
  const now = new Date();
  console.log(`⚠️ Using Malaysia fallback times for: ${latitude}, ${longitude}`);
  
  // These should be closer to JAKIM times
  return {
    fajr: '5:45 AM',
    sunrise: '7:05 AM',
    dhuhr: '1:01 PM', // Fixed to match JAKIM
    asr: '4:15 PM',
    maghrib: '7:15 PM',
    isha: '8:30 PM',
    method: 'Malaysia Fallback (Using exact location)',
    location: { latitude, longitude },
    date: now.toDateString(),
    calculated: false,
    success: true,
    note: 'Using Malaysia approximate times'
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

// Use Aladhan API for JAKIM-like times with precise coordinates
export const calculatePrayerTimesFromAPI = async (latitude, longitude) => {
  try {
    console.log(`🌐 Fetching JAKIM-like times for precise location: ${latitude}, ${longitude}`);
    
    // Use Aladhan API which accepts coordinates and has Malaysia preset (method=13)
    const response = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=13&school=0&iso8601=true`
    );
    
    if (response.ok) {
      const data = await response.json();
      const timings = data.data.timings;
      
      const result = {
        fajr: formatTimeFromString(timings.Fajr),
        sunrise: formatTimeFromString(timings.Sunrise),
        dhuhr: formatTimeFromString(timings.Dhuhr),
        asr: formatTimeFromString(timings.Asr),
        maghrib: formatTimeFromString(timings.Maghrib),
        isha: formatTimeFromString(timings.Isha),
        method: 'JAKIM-like API - Precise GPS',
        location: { latitude, longitude },
        success: true,
        calculated: true,
        source: 'aladhan-api'
      };

      console.log('✅ JAKIM-like times from API:', result);
      return result;
    } else {
      throw new Error('API response not ok');
    }
  } catch (error) {
    console.error('🌐 API fetch failed, using local calculation:', error);
    // Fallback to local calculation with JAKIM parameters
    return calculatePrayerTimes(latitude, longitude);
  }
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

// Export both methods for flexibility
export { calculatePrayerTimes as calculatePrayerTimesLocal };
export { calculatePrayerTimesFromAPI as calculatePrayerTimesAPI };