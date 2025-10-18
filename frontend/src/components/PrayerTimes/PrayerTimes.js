import React, { useState, useEffect, useContext } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Alert,
  Snackbar,
  Grid,
  useTheme
} from '@mui/material';
import { Refresh, CheckCircle, RadioButtonUnchecked, MyLocation, LocationOn } from '@mui/icons-material';
import { usePractice } from '../../context/PracticeContext';
import { useAuth } from '../../context/AuthContext';

// EXACT same zones as e-solat.gov.my with optgroups
const malaysianZones = [
  { group: 'Johor', zones: [
    { value: 'JHR01', label: 'JHR01 - Pulau Aur dan Pulau Pemanggil' },
    { value: 'JHR02', label: 'JHR02 - Johor Bahru, Kota Tinggi, Mersing, Kulai' },
    { value: 'JHR03', label: 'JHR03 - Kluang, Pontian' },
    { value: 'JHR04', label: 'JHR04 - Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak' }
  ]},
  { group: 'Kedah', zones: [
    { value: 'KDH01', label: 'KDH01 - Kota Setar, Kubang Pasu, Pokok Sena (Daerah Kecil)' },
    { value: 'KDH02', label: 'KDH02 - Kuala Muda, Yan, Pendang' },
    { value: 'KDH03', label: 'KDH03 - Padang Terap, Sik' },
    { value: 'KDH04', label: 'KDH04 - Baling' },
    { value: 'KDH05', label: 'KDH05 - Bandar Baharu, Kulim' },
    { value: 'KDH06', label: 'KDH06 - Langkawi' },
    { value: 'KDH07', label: 'KDH07 - Puncak Gunung Jerai' }
  ]},
  { group: 'Kelantan', zones: [
    { value: 'KTN01', label: 'KTN01 - Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku' },
    { value: 'KTN02', label: 'KTN02 - Gua Musang (Daerah Galas Dan Bertam), Jeli, Jajahan Kecil Lojing' }
  ]},
  { group: 'Melaka', zones: [
    { value: 'MLK01', label: 'MLK01 - SELURUH NEGERI MELAKA' }
  ]},
  { group: 'Negeri Sembilan', zones: [
    { value: 'NGS01', label: 'NGS01 - Tampin, Jempol' },
    { value: 'NGS02', label: 'NGS02 - Jelebu, Kuala Pilah, Rembau' },
    { value: 'NGS03', label: 'NGS03 - Port Dickson, Seremban' }
  ]},
  { group: 'Pahang', zones: [
    { value: 'PHG01', label: 'PHG01 - Pulau Tioman' },
    { value: 'PHG02', label: 'PHG02 - Kuantan, Pekan, Muadzam Shah' },
    { value: 'PHG03', label: 'PHG03 - Jerantut, Temerloh, Maran, Bera, Chenor, Jengka' },
    { value: 'PHG04', label: 'PHG04 - Bentong, Lipis, Raub' },
    { value: 'PHG05', label: 'PHG05 - Genting Sempah, Janda Baik, Bukit Tinggi' },
    { value: 'PHG06', label: 'PHG06 - Cameron Highlands, Genting Higlands, Bukit Fraser' },
    { value: 'PHG07', label: 'PHG07 - Zon Khas Daerah Rompin, (Mukim Rompin, Mukim Endau, Mukim Pontian)' }
  ]},
  { group: 'Perlis', zones: [
    { value: 'PLS01', label: 'PLS01 - Kangar, Padang Besar, Arau' }
  ]},
  { group: 'Pulau Pinang', zones: [
    { value: 'PNG01', label: 'PNG01 - Seluruh Negeri Pulau Pinang' }
  ]},
  { group: 'Perak', zones: [
    { value: 'PRK01', label: 'PRK01 - Tapah, Slim River, Tanjung Malim' },
    { value: 'PRK02', label: 'PRK02 - Kuala Kangsar, Sg. Siput , Ipoh, Batu Gajah, Kampar' },
    { value: 'PRK03', label: 'PRK03 - Lenggong, Pengkalan Hulu, Grik' },
    { value: 'PRK04', label: 'PRK04 - Temengor, Belum' },
    { value: 'PRK05', label: 'PRK05 - Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor' },
    { value: 'PRK06', label: 'PRK06 - Selama, Taiping, Bagan Serai, Parit Buntar' },
    { value: 'PRK07', label: 'PRK07 - Bukit Larut' }
  ]},
  { group: 'Sabah', zones: [
    { value: 'SBH01', label: 'SBH01 - Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau' },
    { value: 'SBH02', label: 'SBH02 - Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)' },
    { value: 'SBH03', label: 'SBH03 - Lahad Datu, Silabukan, Kunak, Sahabat, Sempurna, Tungku, Bahagian Tawau (Timur)' },
    { value: 'SBH04', label: 'SBH04 - Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)' },
    { value: 'SBH05', label: 'SBH05 - Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat' },
    { value: 'SBH06', label: 'SBH06 - Gunung Kinabalu' },
    { value: 'SBH07', label: 'SBH07 - Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat' },
    { value: 'SBH08', label: 'SBH08 - Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)' },
    { value: 'SBH09', label: 'SBH09 - Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston, Bahagian Pendalaman (Bawah)' }
  ]},
  { group: 'Selangor', zones: [
    { value: 'SGR01', label: 'SGR01 - Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, S.Alam' },
    { value: 'SGR02', label: 'SGR02 - Kuala Selangor, Sabak Bernam' },
    { value: 'SGR03', label: 'SGR03 - Klang, Kuala Langat' }
  ]},
  { group: 'Sarawak', zones: [
    { value: 'SWK01', label: 'SWK01 - Limbang, Lawas, Sundar, Trusan' },
    { value: 'SWK02', label: 'SWK02 - Miri, Niah, Bekenu, Sibuti, Marudi' },
    { value: 'SWK03', label: 'SWK03 - Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu' },
    { value: 'SWK04', label: 'SWK04 - Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit' },
    { value: 'SWK05', label: 'SWK05 - Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai' },
    { value: 'SWK06', label: 'SWK06 - Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok' },
    { value: 'SWK07', label: 'SWK07 - Serian, Simunjan, Samarahan, Sebuyau, Meludam' },
    { value: 'SWK08', label: 'SWK08 - Kuching, Bau, Lundu, Sematan' },
    { value: 'SWK09', label: 'SWK09 - Zon Khas (Kampung Patarikan)' }
  ]},
  { group: 'Terengganu', zones: [
    { value: 'TRG01', label: 'TRG01 - Kuala Terengganu, Marang, Kuala Nerus' },
    { value: 'TRG02', label: 'TRG02 - Besut, Setiu' },
    { value: 'TRG03', label: 'TRG03 - Hulu Terengganu' },
    { value: 'TRG04', label: 'TRG04 - Dungun, Kemaman' }
  ]},
  { group: 'Wilayah Persekutuan', zones: [
    { value: 'WLY01', label: 'WLY01 - Kuala Lumpur, Putrajaya' },
    { value: 'WLY02', label: 'WLY02 - Labuan' }
  ]}
];

// Comprehensive GPS mapping for ALL Malaysian zones
const preciseGPSMapping = [
  // Selangor (SGR01)
  { lat: 3.0497, lng: 101.5841, zone: 'SGR01', name: 'Kajang' },
  { lat: 3.0733, lng: 101.5185, zone: 'SGR01', name: 'Shah Alam' },
  { lat: 3.1073, lng: 101.6067, zone: 'SGR01', name: 'Petaling Jaya' },
  { lat: 3.2000, lng: 101.6333, zone: 'SGR01', name: 'Kepong' },
  { lat: 2.9936, lng: 101.7870, zone: 'SGR01', name: 'Cyberjaya' },
  { lat: 2.9549, lng: 101.7591, zone: 'SGR01', name: 'Dengkil' },
  { lat: 3.0000, lng: 101.7000, zone: 'SGR01', name: 'Putra Heights' },
  
  // Wilayah Persekutuan (WLY01)
  { lat: 3.1390, lng: 101.6869, zone: 'WLY01', name: 'Kuala Lumpur City Center' },
  { lat: 2.9264, lng: 101.6964, zone: 'WLY01', name: 'Putrajaya Center' },
  { lat: 3.1586, lng: 101.7142, zone: 'WLY01', name: 'Ampang' },
  { lat: 3.0833, lng: 101.6500, zone: 'WLY01', name: 'Cheras' },
  
  // Selangor Other Zones
  { lat: 3.0449, lng: 101.4456, zone: 'SGR03', name: 'Klang' },
  { lat: 2.8189, lng: 101.7250, zone: 'SGR03', name: 'Banting' },
  { lat: 3.3500, lng: 101.2500, zone: 'SGR02', name: 'Kuala Selangor' },
  { lat: 3.6800, lng: 101.5200, zone: 'SGR02', name: 'Bestari Jaya' },
  
  // Johor
  { lat: 1.4927, lng: 103.7414, zone: 'JHR02', name: 'Johor Bahru' },
  { lat: 1.4556, lng: 103.7611, zone: 'JHR02', name: 'Pasir Gudang' },
  { lat: 1.5056, lng: 103.6578, zone: 'JHR02', name: 'Iskandar Puteri' },
  { lat: 2.0333, lng: 103.3167, zone: 'JHR03', name: 'Kluang' },
  { lat: 1.8500, lng: 102.9333, zone: 'JHR04', name: 'Batu Pahat' },
  { lat: 2.5833, lng: 103.8333, zone: 'JHR01', name: 'Mersing' },
  
  // Pulau Pinang
  { lat: 5.4141, lng: 100.3288, zone: 'PNG01', name: 'George Town' },
  { lat: 5.3500, lng: 100.4667, zone: 'PNG01', name: 'Butterworth' },
  { lat: 5.2833, lng: 100.4667, zone: 'PNG01', name: 'Bayan Lepas' },
  
  // Perak
  { lat: 4.5975, lng: 101.0901, zone: 'PRK02', name: 'Ipoh' },
  { lat: 4.8500, lng: 100.7333, zone: 'PRK06', name: 'Taiping' },
  { lat: 4.7667, lng: 100.9333, zone: 'PRK05', name: 'Teluk Intan' },
  { lat: 5.1167, lng: 100.4833, zone: 'PRK01', name: 'Tanjung Malim' },
  
  // Kelantan
  { lat: 6.1254, lng: 102.2381, zone: 'KTN01', name: 'Kota Bharu' },
  { lat: 5.5333, lng: 102.2000, zone: 'KTN01', name: 'Pasir Mas' },
  { lat: 5.2000, lng: 102.0500, zone: 'KTN02', name: 'Gua Musang' },
  
  // Terengganu
  { lat: 5.3296, lng: 103.1370, zone: 'TRG01', name: 'Kuala Terengganu' },
  { lat: 4.2333, lng: 103.4333, zone: 'TRG04', name: 'Kemaman' },
  { lat: 5.7833, lng: 102.5500, zone: 'TRG02', name: 'Besut' },
  
  // Pahang
  { lat: 3.8167, lng: 103.3333, zone: 'PHG02', name: 'Kuantan' },
  { lat: 3.4833, lng: 102.3500, zone: 'PHG03', name: 'Temerloh' },
  { lat: 4.2500, lng: 102.3833, zone: 'PHG04', name: 'Bentong' },
  { lat: 3.9000, lng: 101.8500, zone: 'PHG01', name: 'Genting Highlands' },
  
  // Melaka
  { lat: 2.1896, lng: 102.2501, zone: 'MLK01', name: 'Malacca City' },
  { lat: 2.2667, lng: 102.2833, zone: 'MLK01', name: 'Alor Gajah' },
  { lat: 2.4333, lng: 102.2333, zone: 'MLK01', name: 'Jasin' },
  
  // Negeri Sembilan
  { lat: 2.7259, lng: 101.9378, zone: 'NGS03', name: 'Seremban' },
  { lat: 2.7167, lng: 102.2500, zone: 'NGS01', name: 'Tampin' },
  { lat: 2.8833, lng: 102.2500, zone: 'NGS02', name: 'Kuala Pilah' },
  
  // Kedah
  { lat: 6.1164, lng: 100.3667, zone: 'KDH01', name: 'Alor Setar' },
  { lat: 5.6500, lng: 100.5000, zone: 'KDH02', name: 'Sungai Petani' },
  { lat: 6.3167, lng: 99.8500, zone: 'KDH06', name: 'Langkawi' },
  
  // Perlis
  { lat: 6.4333, lng: 100.2000, zone: 'PLS01', name: 'Kangar' },
  
  // Sabah
  { lat: 5.9804, lng: 116.0735, zone: 'SBH07', name: 'Kota Kinabalu' },
  { lat: 5.8333, lng: 118.1167, zone: 'SBH01', name: 'Sandakan' },
  { lat: 4.2500, lng: 117.2500, zone: 'SBH03', name: 'Lahad Datu' },
  { lat: 5.9167, lng: 116.8333, zone: 'SBH08', name: 'Keningau' },
  
  // Sarawak
  { lat: 1.5397, lng: 110.3542, zone: 'SWK08', name: 'Kuching' },
  { lat: 4.4143, lng: 114.0086, zone: 'SWK02', name: 'Miri' },
  { lat: 2.2870, lng: 111.8307, zone: 'SWK04', name: 'Sibu' },
  { lat: 3.1667, lng: 113.0333, zone: 'SWK03', name: 'Bintulu' },
  
  // Labuan
  { lat: 5.2833, lng: 115.2333, zone: 'WLY02', name: 'Labuan' }
];

// Function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Smart zone detection that works for ALL locations in Malaysia
const findClosestZone = (userLat, userLng) => {
  console.log(`🔍 Finding closest zone for coordinates: ${userLat}, ${userLng}`);
  
  let closestZone = 'SGR01'; // Reasonable default for most populated area
  let shortestDistance = Infinity;
  let closestLocation = null;
  
  for (const location of preciseGPSMapping) {
    const distance = calculateDistance(userLat, userLng, location.lat, location.lng);
    
    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestZone = location.zone;
      closestLocation = location.name;
    }
  }
  
  console.log(`✅ Auto-detected zone: ${closestZone} (${closestLocation}), Distance: ${shortestDistance.toFixed(2)}km`);
  return closestZone;
};

const PrayerTimes = () => {
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [selectedZone, setSelectedZone] = useState('SGR01');
  const [loading, setLoading] = useState(true);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usingGPS, setUsingGPS] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const { trackPrayer, getTodayPrayers } = usePractice();
  const { user } = useAuth();
  const theme = useTheme();

  // Helper function to check if prayer is completed today
  const isPrayerCompletedToday = (prayerName) => {
    if (!user) return false;
    const todayPrayers = getTodayPrayers();
    return todayPrayers.some(prayer => prayer.name.toLowerCase() === prayerName.toLowerCase());
  };

  // Get user's current location - SILENT background detection
  const getCurrentLocation = () => {
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
          enableHighAccuracy: false, // Better for background detection
          timeout: 15000,
          maximumAge: 300000 // 5 minutes cache
        }
      );
    });
  };

  // Auto-detect location on component mount - SILENT
  const autoDetectLocation = async () => {
    try {
      setLocationLoading(true);
      const location = await getCurrentLocation();
      const zoneCode = findClosestZone(location.latitude, location.longitude);
      
      setUserLocation(location);
      setSelectedZone(zoneCode);
      setUsingGPS(true);
      await loadPrayerTimes(zoneCode);
      
      // Show snackbar notification instead of alert
      setSnackbarMessage(`Location auto-detected: Zone ${zoneCode}`);
      setSnackbarOpen(true);
      
      console.log('✅ Auto-location detected:', {
        coordinates: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        zone: zoneCode,
        accuracy: `${Math.round(location.accuracy)}m`
      });
      
    } catch (error) {
      console.log('❌ Auto-location failed, using default:', error);
      setUsingGPS(false);
      await loadPrayerTimes(selectedZone);
    } finally {
      setLocationLoading(false);
    }
  };

  // Manual location detection - only when user explicitly clicks
  const handleDetectLocation = async () => {
    setLocationLoading(true);
    try {
      const location = await getCurrentLocation();
      const zoneCode = findClosestZone(location.latitude, location.longitude);
      
      setUserLocation(location);
      setSelectedZone(zoneCode);
      setUsingGPS(true);
      await loadPrayerTimes(zoneCode);
      
      setSnackbarMessage(`📍 Location detected! Zone: ${zoneCode}`);
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error('❌ Location detection failed:', error);
      let errorMessage = 'Unable to detect your location. ';
      
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage += 'Please allow location access in your browser settings.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage += 'Location detection timed out.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage += 'Location information unavailable.';
      }
      
      setError(errorMessage);
      setUsingGPS(false);
    } finally {
      setLocationLoading(false);
    }
  };

  // Convert time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (timeStr) => {
    if (!timeStr) return '--:--';
    
    // If already in 12-hour format, return as is
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      return timeStr;
    }
    
    // Convert from 24-hour format to 12-hour format
    try {
      const [hours, minutes] = timeStr.split(':');
      let hour = parseInt(hours);
      const minute = minutes || '00';
      
      const period = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12 || 12; // Convert 0 to 12, 13 to 1, etc.
      
      return `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeStr;
    }
  };

  const fetchPrayerTimes = async (zoneCode) => {
    try {
      setError(null);
      
      // Dynamic API URL for different environments
      const getApiBase = () => {
        // Development - works on localhost
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          return 'http://localhost:5000';
        }
        // Production - your Render backend URL
        return 'https://muslimdailybackend.onrender.com';
      };

      const API_BASE = getApiBase();
      const response = await fetch(`${API_BASE}/api/prayertimes/${zoneCode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch prayer times from server');
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const formattedTimes = {
          fajr: formatTimeTo12Hour(data.data.fajr),
          dhuhr: formatTimeTo12Hour(data.data.dhuhr),
          asr: formatTimeTo12Hour(data.data.asr),
          maghrib: formatTimeTo12Hour(data.data.maghrib),
          isha: formatTimeTo12Hour(data.data.isha),
          method: 'JAKIM e-solat.gov.my (Live)',
          zone: zoneCode,
          success: true
        };
        
        return formattedTimes;
      } else {
        throw new Error(data.error || 'No prayer times data received');
      }
    } catch (error) {
      console.error('API Error:', error);
      
      // Fallback to sample times if API fails
      setError('Unable to fetch live prayer times. Using sample times.');
      return getSamplePrayerTimes(zoneCode);
    }
  };

  // Add this fallback function
  const getSamplePrayerTimes = (zoneCode) => {
    return {
      fajr: '5:45 AM',
      dhuhr: '1:15 PM', 
      asr: '4:30 PM',
      maghrib: '7:15 PM',
      isha: '8:30 PM',
      method: 'Sample Times (Backend Unavailable)',
      zone: zoneCode,
      success: true
    };
  };

  const loadPrayerTimes = async (zoneCode = selectedZone) => {
    setLoading(true);
    try {
      const times = await fetchPrayerTimes(zoneCode);
      setPrayerTimes(times);
      setNextPrayer(getNextPrayer(times));
      setSelectedZone(zoneCode);
    } catch (error) {
      console.error('Error loading prayer times:', error);
      setError('Unable to fetch prayer times. Please check if your backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = async (zoneCode) => {
    setSelectedZone(zoneCode);
    setUsingGPS(false);
    setUserLocation(null);
    await loadPrayerTimes(zoneCode);
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

  // Get next prayer
  const getNextPrayer = (prayerTimes) => {
    if (!prayerTimes) return null;
    
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
    if (!timeStr) return new Date();
    
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
            {locationLoading ? 'Detecting your location...' : 'Loading prayer times...'}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          {/* Header - COMPACT */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '1.25rem' }}>
                🕌 Prayer Times
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<MyLocation />}
                onClick={handleDetectLocation}
                disabled={locationLoading}
                variant={usingGPS ? "contained" : "outlined"}
                color={usingGPS ? "success" : "primary"}
                sx={{ fontSize: '0.8rem' }}
              >
                {locationLoading ? 'Detecting...' : 'Refresh Location'}
              </Button>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, fontSize: '0.8rem' }}>
              {error}
            </Alert>
          )}

       // In PrayerTimes.js, update the alert message:
{!user && (
  <Alert severity="info" sx={{ mb: 2, fontSize: '0.8rem' }}>
    Click on "Start Your Journey" to track your prayers and view progress
  </Alert>
)}

          {/* Zone Selection - UPDATED: Smaller fonts */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel sx={{ fontSize: '0.8rem' }}>Select Zone</InputLabel>
            <Select
              value={selectedZone}
              label="Select Zone"
              onChange={(e) => handleZoneChange(e.target.value)}
              disabled={loading}
              sx={{
                fontSize: '0.8rem',
                '& .MuiSelect-select': {
                  fontSize: '0.8rem',
                  py: 1
                }
              }}
            >
              {malaysianZones.map((state) => [
                <Typography 
                  key={state.group} 
                  component="div" 
                  sx={{ 
                    px: 2, 
                    py: 1, 
                    fontWeight: 'bold', 
                    backgroundColor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.75rem', // Smaller group headers
                    color: 'text.secondary'
                  }}
                >
                  {state.group}
                </Typography>,
                ...state.zones.map(zone => (
                  <MenuItem 
                    key={zone.value} 
                    value={zone.value} 
                    sx={{ 
                      pl: 3,
                      fontSize: '0.75rem', // Smaller menu items
                      py: 0.5, // Tighter padding
                      minHeight: '32px', // Smaller height
                    }}
                  >
                    {zone.label}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>

          {/* Next Prayer - COMPACT */}
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

          {/* Prayer Times List - COMPACT GRID */}
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
                        opacity: isCompleted ? 0.8 : 1
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
                            opacity: !user ? 0.5 : 1
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

          {/* Footer Info - SIMPLIFIED */}
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Live data from JAKIM • Zone: {selectedZone}
              {userLocation && ` • GPS: ${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar for location detection */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default PrayerTimes;