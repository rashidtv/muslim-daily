const express = require('express');
const router = express.Router();
const axios = require('axios');

// Get prayer times from e-solat API
router.get('/:zoneCode', async (req, res) => {
  try {
    const { zoneCode } = req.params;
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Call e-solat API directly from backend (no CORS issues)
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