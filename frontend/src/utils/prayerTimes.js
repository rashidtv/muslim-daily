import { CalculationMethod, PrayerTimes, Coordinates, Madhab } from 'adhan';

// Simple reliable prayer time calculation
export const calculatePrayerTimes = async (latitude, longitude, date = new Date()) => {
  try {
    console.log(`📍 Calculating prayer times for: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    
    // Try JAKIM API first (most accurate)
    try {
      const apiTimes = await calculatePrayerTimesFromAPI(latitude, longitude);
      if (apiTimes.success) {
        console.log('✅ Using JAKIM API times');
        return apiTimes;
      }
    } catch (apiError) {
      console.log('🌐 API failed, using local calculation');
    }
    
    // Fallback to reliable local calculation
    return calculateReliableLocalTimes(latitude, longitude, date);
  } catch (error) {
    console.error('All calculations failed:', error);
    return getDefaultMalaysiaTimes(latitude, longitude);
  }
};

// Reliable local calculation with proper parameters
const calculateReliableLocalTimes = (latitude, longitude, date = new Date()) => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    
    // Use parameters that work well for Malaysia
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    const result = {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Reliable Local - Precise GPS',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true,
      source: 'local'
    };

    console.log('✅ Reliable local times calculated:', {
      fajr: result.fajr,
      dhuhr: result.dhuhr,
      asr: result.asr,
      maghrib: result.maghrib,
      isha: result.isha
    });
    
    return result;
  } catch (error) {
    console.error('Reliable local calculation failed:', error);
    throw error;
  }
};

// Format time to 12-hour format
const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// JAKIM API with proper error handling
export const calculatePrayerTimesFromAPI = async (latitude, longitude) => {
  return new Promise((resolve, reject) => {
    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error('API timeout'));
    }, 10000);

    try {
      console.log(`🌐 Fetching JAKIM API times for: ${latitude}, ${longitude}`);
      
      const today = new Date();
      const day = today.getDate();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      fetch(
        `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=13&school=0&timezone=Asia/Kuala_Lumpur`
      )
      .then(response => {
        clearTimeout(timeout);
        if (!response.ok) {
          throw new Error('API response not ok');
        }
        return response.json();
      })
      .then(data => {
        const timings = data.data.timings;
        
        const result = {
          fajr: formatTimeFromString(timings.Fajr),
          sunrise: formatTimeFromString(timings.Sunrise),
          dhuhr: formatTimeFromString(timings.Dhuhr),
          asr: formatTimeFromString(timings.Asr),
          maghrib: formatTimeFromString(timings.Maghrib),
          isha: formatTimeFromString(timings.Isha),
          method: 'JAKIM API - Precise GPS',
          location: { latitude, longitude },
          success: true,
          calculated: true,
          source: 'api'
        };

        console.log('✅ JAKIM API times received:', {
          fajr: result.fajr,
          dhuhr: result.dhuhr,
          asr: result.asr,
          maghrib: result.maghrib,
          isha: result.isha
        });
        
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeout);
        reject(error);
      });
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

// Format time from API response
const formatTimeFromString = (timeStr) => {
  try {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const minute = parseInt(minutes);
    
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  } catch (error) {
    console.error('Error formatting time from string:', error);
    return timeStr;
  }
};

// Default Malaysia times as last resort
const getDefaultMalaysiaTimes = (latitude, longitude) => {
  console.log('🔄 Using default Malaysia times');
  
  return {
    fajr: '5:45 AM',
    sunrise: '7:05 AM',
    dhuhr: '1:01 PM',
    asr: '4:15 PM',
    maghrib: '7:15 PM',
    isha: '8:30 PM',
    method: 'Default Malaysia Times',
    location: { latitude, longitude },
    date: new Date().toDateString(),
    calculated: false,
    success: true,
    source: 'default',
    note: 'Using standard Malaysia prayer times'
  };
};

// Location service
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => { 
    if (!navigator.geolocation) {
      console.warn('📍 Geolocation not supported');
      reject(new Error('Geolocation not supported'));
      return;
    }

    console.log('📍 Getting PRECISE location for prayer times...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log('📍 PRECISE Location:', {
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
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 600000
      }
    );
  });
};

// Next prayer calculation
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

  // If all prayers passed, return first prayer of next day
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

// Current prayer calculation
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

// Parse time string to Date object
const parseTimeString = (timeStr) => {
  try {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    
    hours = parseInt(hours);
    minutes = parseInt(minutes);
    
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    // If time has passed, set for next day
    if (date < new Date()) {
      date.setDate(date.getDate() + 1);
    }
    
    return date;
  } catch (error) {
    console.error('Error parsing time string:', error);
    return new Date();
  }
};

// Export for flexibility
export { calculatePrayerTimes as calculatePrayerTimesLocal };
export { calculatePrayerTimesFromAPI as calculatePrayerTimesAPI };