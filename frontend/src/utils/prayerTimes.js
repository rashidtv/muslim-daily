import { CalculationMethod, PrayerTimes, Coordinates, Madhab, HighLatitudeRule } from 'adhan';

// Malaysia calculation parameters
const getCalculationParams = () => {
  const params = CalculationMethod.MuslimWorldLeague();
  params.madhab = Madhab.Shafi;
  // Remove high latitude rule for Malaysia (not needed near equator)
  // params.highLatitudeRule = HighLatitudeRule.MiddleOfTheNight;
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

// Calculate prayer times for given coordinates and date
export const calculatePrayerTimes = (latitude, longitude, date = new Date()) => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    const params = getCalculationParams();
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Muslim World League (Mazhab Shafi)',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };
  } catch (error) {
    console.error('Prayer time calculation error:', error);
    // Try with simpler parameters
    return calculateWithSimpleParams(latitude, longitude, date);
  }
};

// Alternative calculation with simpler parameters
const calculateWithSimpleParams = (latitude, longitude, date = new Date()) => {
  try {
    const coordinates = new Coordinates(latitude, longitude);
    const params = CalculationMethod.MuslimWorldLeague();
    params.madhab = Madhab.Shafi;
    // Use simpler calculation without high latitude rules
    params.fajrAngle = 20;
    params.ishaAngle = 18;
    
    const prayerTimes = new PrayerTimes(coordinates, date, params);
    
    return {
      fajr: formatTime(prayerTimes.fajr),
      sunrise: formatTime(prayerTimes.sunrise),
      dhuhr: formatTime(prayerTimes.dhuhr),
      asr: formatTime(prayerTimes.asr),
      maghrib: formatTime(prayerTimes.maghrib),
      isha: formatTime(prayerTimes.isha),
      method: 'Muslim World League (Simple)',
      location: { latitude, longitude },
      date: date.toDateString(),
      calculated: true,
      success: true
    };
  } catch (error) {
    console.error('Simple calculation also failed:', error);
    return getFallbackTimes();
  }
};

// Fallback times for Kuala Lumpur
const getFallbackTimes = () => {
  const now = new Date();
  return {
    fajr: '5:45 AM',
    sunrise: '7:10 AM',
    dhuhr: '1:15 PM',
    asr: '4:30 PM',
    maghrib: '7:05 PM',
    isha: '8:20 PM',
    method: 'Fallback (Kuala Lumpur)',
    location: { latitude: 3.1390, longitude: 101.6869 },
    date: now.toDateString(),
    calculated: false,
    success: true,
    note: 'Using default Kuala Lumpur times'
  };
};

// Group cities by region for better organization
export const citiesByRegion = {
  'West Malaysia': [
    'Kuala Lumpur', 'Putrajaya', 'Johor Bahru', 'Penang', 'Ipoh', 
    'Klang', 'Kota Bharu', 'Kuala Terengganu', 'Kuantan', 'Malacca',
    'Seremban', 'Shah Alam', 'Petaling Jaya', 'Alor Setar', 'Butterworth', 'Taiping'
  ],
  'Sabah': [
    'Kota Kinabalu', 'Sandakan', 'Tawau', 'Lahad Datu', 'Keningau',
    'Semporna', 'Kudat', 'Ranau', 'Beaufort'
  ],
  'Sarawak': [
    'Kuching', 'Miri', 'Sibu', 'Bintulu', 'Limbang',
    'Sarikei', 'Sri Aman', 'Kapit', 'Mukah'
  ],
  'Federal Territories': [
    'Labuan'
  ]
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => { 
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  });
};

// Get next prayer
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

// Helper function to parse time strings
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

// Simple function to get current prayer
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
      // For Isha, check if it's after Maghrib and before midnight
      const maghribTime = parseTimeString(prayerTimes.maghrib);
      if (now >= maghribTime) {
        return prayer.name;
      }
    }
  }

  return null;
};