const express = require('express');
const router = express.Router();
const axios = require('axios');

// COMPLETE MALAYSIA COORDINATE TO ZONE MAPPING
const findZoneFromCoordinates = (lat, lng) => {
  const zones = [
    // Johor
    { code: 'JHR01', latMin: 2.0, latMax: 2.8, lngMin: 103.8, lngMax: 104.5, state: 'Johor', name: 'Pulau Aur dan Pulau Pemanggil' },
    { code: 'JHR02', latMin: 1.4, latMax: 2.0, lngMin: 103.5, lngMax: 104.2, state: 'Johor', name: 'Johor Bahru, Kota Tinggi, Mersing, Kulai' },
    { code: 'JHR03', latMin: 1.8, latMax: 2.3, lngMin: 102.8, lngMax: 103.5, state: 'Johor', name: 'Kluang, Pontian' },
    { code: 'JHR04', latMin: 1.8, latMax: 2.5, lngMin: 102.5, lngMax: 103.2, state: 'Johor', name: 'Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak' },

    // Kedah
    { code: 'KDH01', latMin: 5.8, latMax: 6.5, lngMin: 100.1, lngMax: 100.6, state: 'Kedah', name: 'Kota Setar, Kubang Pasu, Pokok Sena' },
    { code: 'KDH02', latMin: 5.6, latMax: 6.0, lngMin: 100.3, lngMax: 100.8, state: 'Kedah', name: 'Kuala Muda, Yan, Pendang' },
    { code: 'KDH03', latMin: 6.0, latMax: 6.5, lngMin: 100.6, lngMax: 101.0, state: 'Kedah', name: 'Padang Terap, Sik' },
    { code: 'KDH04', latMin: 5.6, latMax: 6.0, lngMin: 100.8, lngMax: 101.2, state: 'Kedah', name: 'Baling' },
    { code: 'KDH05', latMin: 5.3, latMax: 5.7, lngMin: 100.5, lngMax: 100.9, state: 'Kedah', name: 'Bandar Baharu, Kulim' },
    { code: 'KDH06', latMin: 6.2, latMax: 6.5, lngMin: 99.7, lngMax: 100.0, state: 'Kedah', name: 'Langkawi' },
    { code: 'KDH07', latMin: 5.8, latMax: 6.0, lngMin: 100.6, lngMax: 100.8, state: 'Kedah', name: 'Puncak Gunung Jerai' },

    // Kelantan
    { code: 'KTN01', latMin: 5.5, latMax: 6.2, lngMin: 101.8, lngMax: 102.5, state: 'Kelantan', name: 'Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku' },
    { code: 'KTN02', latMin: 4.5, latMax: 5.5, lngMin: 101.5, lngMax: 102.5, state: 'Kelantan', name: 'Gua Musang, Jeli, Jajahan Kecil Lojing' },

    // Melaka
    { code: 'MLK01', latMin: 2.1, latMax: 2.5, lngMin: 102.1, lngMax: 102.4, state: 'Melaka', name: 'SELURUH NEGERI MELAKA' },

    // Negeri Sembilan
    { code: 'NGS01', latMin: 2.4, latMax: 2.8, lngMin: 102.1, lngMax: 102.5, state: 'Negeri Sembilan', name: 'Tampin, Jempol' },
    { code: 'NGS02', latMin: 2.6, latMax: 3.1, lngMin: 101.9, lngMax: 102.3, state: 'Negeri Sembilan', name: 'Jelebu, Kuala Pilah, Rembau' },
    { code: 'NGS03', latMin: 2.4, latMax: 2.8, lngMin: 101.7, lngMax: 102.1, state: 'Negeri Sembilan', name: 'Port Dickson, Seremban' },

    // Pahang
    { code: 'PHG01', latMin: 2.7, latMax: 2.9, lngMin: 104.1, lngMax: 104.3, state: 'Pahang', name: 'Pulau Tioman' },
    { code: 'PHG02', latMin: 3.4, latMax: 4.0, lngMin: 102.9, lngMax: 103.6, state: 'Pahang', name: 'Kuantan, Pekan, Muadzam Shah' },
    { code: 'PHG03', latMin: 3.2, latMax: 4.0, lngMin: 102.0, lngMax: 103.0, state: 'Pahang', name: 'Jerantut, Temerloh, Maran, Bera, Chenor, Jengka' },
    { code: 'PHG04', latMin: 3.3, latMax: 4.0, lngMin: 101.5, lngMax: 102.3, state: 'Pahang', name: 'Bentong, Lipis, Raub' },
    { code: 'PHG05', latMin: 3.2, latMax: 3.4, lngMin: 101.7, lngMax: 101.9, state: 'Pahang', name: 'Genting Sempah, Janda Baik, Bukit Tinggi' },
    { code: 'PHG06', latMin: 4.3, latMax: 4.7, lngMin: 101.3, lngMax: 101.5, state: 'Pahang', name: 'Cameron Highlands, Genting Highlands, Bukit Fraser' },
    { code: 'PHG07', latMin: 2.5, latMax: 3.2, lngMin: 103.0, lngMax: 103.8, state: 'Pahang', name: 'Zon Khas Daerah Rompin' },

    // Perlis
    { code: 'PLS01', latMin: 6.3, latMax: 6.7, lngMin: 100.1, lngMax: 100.4, state: 'Perlis', name: 'Kangar, Padang Besar, Arau' },

    // Pulau Pinang
    { code: 'PNG01', latMin: 5.1, latMax: 5.5, lngMin: 100.2, lngMax: 100.5, state: 'Pulau Pinang', name: 'Seluruh Negeri Pulau Pinang' },

    // Perak
    { code: 'PRK01', latMin: 3.8, latMax: 4.3, lngMin: 101.0, lngMax: 101.5, state: 'Perak', name: 'Tapah, Slim River, Tanjung Malim' },
    { code: 'PRK02', latMin: 4.3, latMax: 5.0, lngMin: 100.8, lngMax: 101.3, state: 'Perak', name: 'Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar' },
    { code: 'PRK03', latMin: 5.0, latMax: 5.8, lngMin: 100.8, lngMax: 101.3, state: 'Perak', name: 'Lenggong, Pengkalan Hulu, Grik' },
    { code: 'PRK04', latMin: 5.3, latMax: 5.8, lngMin: 101.1, lngMax: 101.5, state: 'Perak', name: 'Temengor, Belum' },
    { code: 'PRK05', latMin: 3.8, latMax: 4.5, lngMin: 100.6, lngMax: 101.1, state: 'Perak', name: 'Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor' },
    { code: 'PRK06', latMin: 4.7, latMax: 5.2, lngMin: 100.5, lngMax: 100.9, state: 'Perak', name: 'Selama, Taiping, Bagan Serai, Parit Buntar' },
    { code: 'PRK07', latMin: 4.8, latMax: 5.0, lngMin: 100.8, lngMax: 101.0, state: 'Perak', name: 'Bukit Larut' },

    // Sabah
    { code: 'SBH01', latMin: 5.5, latMax: 6.5, lngMin: 117.5, lngMax: 119.0, state: 'Sabah', name: 'Sandakan, Bukit Garam, Semawang, Temanggong, Tambisan' },
    { code: 'SBH02', latMin: 5.0, latMax: 6.0, lngMin: 116.5, lngMax: 118.0, state: 'Sabah', name: 'Beluran, Telupid, Pinangah, Terusan, Kuamut' },
    { code: 'SBH03', latMin: 4.0, latMax: 5.5, lngMin: 117.5, lngMax: 119.0, state: 'Sabah', name: 'Lahad Datu, Silabukan, Kunak, Sahabat, Sempurna, Tungku' },
    { code: 'SBH04', latMin: 4.0, latMax: 5.0, lngMin: 117.0, lngMax: 118.5, state: 'Sabah', name: 'Tawau, Balong, Merotai, Kalabakan' },
    { code: 'SBH05', latMin: 6.5, latMax: 7.5, lngMin: 116.5, lngMax: 117.5, state: 'Sabah', name: 'Kudat, Kota Marudu, Pitas, Pulau Banggi' },
    { code: 'SBH06', latMin: 5.8, latMax: 6.5, lngMin: 116.0, lngMax: 116.8, state: 'Sabah', name: 'Gunung Kinabalu' },
    { code: 'SBH07', latMin: 5.5, latMax: 6.5, lngMin: 115.5, lngMax: 116.5, state: 'Sabah', name: 'Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan' },
    { code: 'SBH08', latMin: 4.5, latMax: 6.0, lngMin: 115.5, lngMax: 117.0, state: 'Sabah', name: 'Pensiangan, Keningau, Tambunan, Nabawan' },
    { code: 'SBH09', latMin: 5.0, latMax: 5.8, lngMin: 115.0, lngMax: 116.0, state: 'Sabah', name: 'Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston' },

    // Sarawak
    { code: 'SWK01', latMin: 4.5, latMax: 5.0, lngMin: 114.8, lngMax: 115.5, state: 'Sarawak', name: 'Limbang, Lawas, Sundar, Trusan' },
    { code: 'SWK02', latMin: 3.5, latMax: 4.5, lngMin: 113.5, lngMax: 114.5, state: 'Sarawak', name: 'Miri, Niah, Bekenu, Sibuti, Marudi' },
    { code: 'SWK03', latMin: 2.5, latMax: 3.5, lngMin: 112.5, lngMax: 114.0, state: 'Sarawak', name: 'Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu' },
    { code: 'SWK04', latMin: 1.5, latMax: 2.5, lngMin: 111.0, lngMax: 113.5, state: 'Sarawak', name: 'Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit' },
    { code: 'SWK05', latMin: 1.5, latMax: 2.5, lngMin: 110.5, lngMax: 112.0, state: 'Sarawak', name: 'Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai' },
    { code: 'SWK06', latMin: 1.0, latMax: 2.0, lngMin: 110.5, lngMax: 111.5, state: 'Sarawak', name: 'Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok' },
    { code: 'SWK07', latMin: 1.0, latMax: 1.8, lngMin: 110.0, lngMax: 111.0, state: 'Sarawak', name: 'Serian, Simunjan, Samarahan, Sebuyau, Meludam' },
    { code: 'SWK08', latMin: 1.0, latMax: 2.0, lngMin: 109.5, lngMax: 110.5, state: 'Sarawak', name: 'Kuching, Bau, Lundu, Sematan' },
    { code: 'SWK09', latMin: 1.5, latMax: 2.0, lngMin: 111.5, lngMax: 112.0, state: 'Sarawak', name: 'Zon Khas (Kampung Patarikan)' },

    // Selangor
    { code: 'SGR01', latMin: 2.8, latMax: 3.4, lngMin: 101.4, lngMax: 101.9, state: 'Selangor', name: 'Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam' },
    { code: 'SGR02', latMin: 3.4, latMax: 3.8, lngMin: 101.0, lngMax: 101.6, state: 'Selangor', name: 'Kuala Selangor, Sabak Bernam' },
    { code: 'SGR03', latMin: 2.7, latMax: 3.1, lngMin: 101.3, lngMax: 101.6, state: 'Selangor', name: 'Klang, Kuala Langat' },

    // Terengganu
    { code: 'TRG01', latMin: 5.0, latMax: 5.5, lngMin: 102.8, lngMax: 103.3, state: 'Terengganu', name: 'Kuala Terengganu, Marang, Kuala Nerus' },
    { code: 'TRG02', latMin: 5.5, latMax: 6.0, lngMin: 102.4, lngMax: 103.0, state: 'Terengganu', name: 'Besut, Setiu' },
    { code: 'TRG03', latMin: 4.5, latMax: 5.5, lngMin: 102.5, lngMax: 103.2, state: 'Terengganu', name: 'Hulu Terengganu' },
    { code: 'TRG04', latMin: 4.0, latMax: 5.0, lngMin: 103.0, lngMax: 103.8, state: 'Terengganu', name: 'Dungun, Kemaman' },

    // Wilayah Persekutuan
    { code: 'WLY01', latMin: 2.9, latMax: 3.3, lngMin: 101.6, lngMax: 101.8, state: 'Wilayah Persekutuan', name: 'Kuala Lumpur, Putrajaya' },
    { code: 'WLY02', latMin: 5.2, latMax: 5.4, lngMin: 115.1, lngMax: 115.3, state: 'Wilayah Persekutuan', name: 'Labuan' }
  ];

  // Find matching zone
  for (const zone of zones) {
    if (lat >= zone.latMin && lat <= zone.latMax && 
        lng >= zone.lngMin && lng <= zone.lngMax) {
      console.log(`📍 Coordinates ${lat}, ${lng} → ${zone.state} ${zone.code}: ${zone.name}`);
      return zone.code;
    }
  }

  // If no exact match, find closest zone by distance
  const closestZone = findClosestZoneByDistance(lat, lng, zones);
  console.log(`📍 No exact match for ${lat}, ${lng} → Using closest: ${closestZone.state} ${closestZone.code}`);
  return closestZone.code;
};

// Fallback: Find closest zone by distance
const findClosestZoneByDistance = (lat, lng, zones) => {
  let closestZone = zones[0];
  let shortestDistance = Number.MAX_SAFE_INTEGER;

  // Calculate center point of each zone
  zones.forEach(zone => {
    const zoneCenterLat = (zone.latMin + zone.latMax) / 2;
    const zoneCenterLng = (zone.lngMin + zone.lngMax) / 2;
    
    const distance = Math.sqrt(
      Math.pow(lat - zoneCenterLat, 2) + Math.pow(lng - zoneCenterLng, 2)
    );

    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestZone = zone;
    }
  });

  return closestZone;
};

// NEW ROUTE: Get prayer times from precise coordinates
router.get('/coordinates/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    console.log(`📍 Converting coordinates to zone: ${latitude}, ${longitude}`);

    // Validate coordinates
    if (isNaN(latitude) || isNaN(longitude) || 
        latitude < 0.5 || latitude > 7.5 || 
        longitude < 99.0 || longitude > 120.0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates. Must be within Malaysia boundaries.'
      });
    }

    // Find the correct JAKIM zone
    const zoneCode = findZoneFromCoordinates(latitude, longitude);
    
    console.log(`✅ Coordinates ${latitude}, ${longitude} → Zone ${zoneCode}`);

    // Use your existing JAKIM e-solat API
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const response = await axios.get(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=date&zone=${zoneCode}&date=${year}-${month}-${day}`
    );

    if (response.data.prayerTime && response.data.prayerTime.length > 0) {
      const times = response.data.prayerTime[0];
      
      res.json({
        success: true,
        data: {
          fajr: times.fajr,
          dhuhr: times.dhuhr,
          asr: times.asr,
          maghrib: times.maghrib,
          isha: times.isha,
          date: times.date,
          zone: zoneCode,
          coordinates: { latitude, longitude }
        },
        source: 'jakim-official'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No prayer times found for this zone'
      });
    }
  } catch (error) {
    console.error('Coordinate prayer time error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prayer times from coordinates: ' + error.message
    });
  }
});

// Keep your existing zone-based route
router.get('/:zoneCode', async (req, res) => {
  try {
    const { zoneCode } = req.params;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    const response = await axios.get(
      `https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=date&zone=${zoneCode}&date=${year}-${month}-${day}`
    );

    if (response.data.prayerTime && response.data.prayerTime.length > 0) {
      const times = response.data.prayerTime[0];
      res.json({
        success: true,
        data: {
          fajr: times.fajr,
          dhuhr: times.dhuhr,
          asr: times.asr,
          maghrib: times.maghrib,
          isha: times.isha,
          date: times.date,
          zone: zoneCode
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'No prayer times found'
      });
    }
  } catch (error) {
    console.error('e-solat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prayer times'
    });
  }
});

module.exports = router;