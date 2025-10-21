// Use your backend JAKIM API with precise coordinates for ALL Malaysia locations
export const calculatePrayerTimes = async (latitude, longitude) => {
  try {
    console.log(`📍 Getting JAKIM times via backend for: ${latitude}, ${longitude}`);
    
    const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'http://localhost:5000' 
      : 'https://muslimdailybackend.onrender.com'; // Your actual backend URL

    const response = await fetch(
      `${API_BASE}/api/prayertimes/coordinates/${latitude}/${longitude}`
    );

    if (response.ok) {
      const data = await response.json();
      
      if (data.success) {
        const result = {
          fajr: formatTimeFromString(data.data.fajr),
          sunrise: calculateSunriseTime(data.data.fajr), // Estimate sunrise
          dhuhr: formatTimeFromString(data.data.dhuhr),
          asr: formatTimeFromString(data.data.asr),
          maghrib: formatTimeFromString(data.data.maghrib),
          isha: formatTimeFromString(data.data.isha),
          method: `JAKIM ${data.data.zone} - Precise GPS`,
          location: { latitude, longitude },
          date: new Date().toDateString(),
          calculated: true,
          success: true,
          source: 'backend-jakim',
          zone: data.data.zone
        };

        console.log('✅ Backend JAKIM times:', result);
        return result;
      }
    }
    
    throw new Error('Backend API failed');
  } catch (error) {
    console.error('Backend API failed, using reliable fallback:', error);
    return calculateReliableFallback(latitude, longitude);
  }
};

// Estimate sunrise based on Fajr time
const calculateSunriseTime = (fajrTime) => {
  const [fajrHours, fajrMinutes] = fajrTime.split(':');
  let hours = parseInt(fajrHours);
  let minutes = parseInt(fajrMinutes);
  
  // Sunrise is typically about 1-1.5 hours after Fajr
  minutes += 90; // 1.5 hours
  if (minutes >= 60) {
    hours += 1;
    minutes -= 60;
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Simple fallback calculation
const calculateReliableFallback = async (latitude, longitude) => {
  try {
    const { CalculationMethod, PrayerTimes, Coordinates, Madhab } = await import('adhan');
    
    const coordinates = new Coordinates(latitude, longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    
    const prayerTimes = new PrayerTimes(coordinates, new Date(), params);
    
    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Reliable Fallback - Precise GPS',
      location: { latitude, longitude },
      calculated: true,
      success: true,
      source: 'fallback'
    };
  } catch (error) {
    console.error('Fallback calculation failed:', error);
    return getDefaultTimes(latitude, longitude);
  }
};

// Absolute fallback
const getDefaultTimes = (latitude, longitude) => {
  return {
    fajr: '5:45 AM',
    sunrise: '7:05 AM',
    dhuhr: '1:01 PM',
    asr: '4:15 PM',
    maghrib: '7:15 PM',
    isha: '8:30 PM',
    method: 'Default Malaysia Times',
    location: { latitude, longitude },
    calculated: false,
    success: true,
    source: 'default'
  };
};

const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

const formatTimeFromString = (timeStr) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${period}`;
};

// Location service
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => { 
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        
        console.log('📍 Location obtained:', {
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

// Keep existing helper functions
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

export { calculatePrayerTimes as calculatePrayerTimesLocal };
export { calculatePrayerTimes as calculatePrayerTimesAPI };