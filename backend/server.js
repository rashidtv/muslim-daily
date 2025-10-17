const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (FREE - no database needed initially)
const users = new Map();
const practices = new Map();

// Simple user data structure
const createUser = (id) => ({
  id,
  name: `User${id}`,
  location: 'Kuala Lumpur',
  zone: 'WLY01', // Default KL zone
  createdAt: new Date().toISOString(),
  streak: 0,
  lastPracticeDate: null
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🕌 MuslimDaily API - Free Muslim Practice Companion',
    version: '1.0.0',
    status: 'Alhamdulillah! Serving the Muslim community for free!',
    features: [
      'Prayer time tracking',
      'Quran reading tracker',
      'Dhikr counter',
      'Progress analytics',
      'Completely FREE forever'
    ]
  });
});

// Add this health check route
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Muslim Daily API is running!',
    timestamp: new Date().toISOString()
  });
});

const prayerTimesRoutes = require('./routes/prayerTimes');
app.use('/api/prayertimes', prayerTimesRoutes);

// Health check - add this to your server.js
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Muslim Daily API is running!',
    timestamp: new Date().toISOString()
  });
});

// Prayer times endpoint
app.get('/api/prayer-times/:zone?', async (req, res) => {
  try {
    const zone = req.params.zone || 'WLY01'; // Default to KL
    
    // Mock prayer times for now (we'll integrate JAKIM API later)
    const mockPrayerTimes = {
      fajr: '5:45 AM',
      dhuhr: '1:15 PM', 
      asr: '4:30 PM',
      maghrib: '7:05 PM',
      isha: '8:20 PM',
      source: 'JAKIM e-Solat',
      zone: zone,
      date: new Date().toDateString()
    };
    
    res.json(mockPrayerTimes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch prayer times' });
  }
});

// Track practice endpoint
app.post('/api/practices/track', (req, res) => {
  try {
    const { userId, practiceType, practiceData } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Create user if doesn't exist
    if (!users.has(userId)) {
      users.set(userId, createUser(userId));
    }
    
    // Initialize practices array if doesn't exist
    if (!practices.has(userId)) {
      practices.set(userId, []);
    }
    
    const practice = {
      type: practiceType, // 'fajr', 'dhuhr', 'quran', 'dhikr', etc.
      data: practiceData,
      timestamp: new Date().toISOString(),
      id: Date.now().toString()
    };
    
    practices.get(userId).push(practice);
    
    // Update user streak
    const user = users.get(userId);
    const today = new Date().toDateString();
    const lastDate = user.lastPracticeDate ? new Date(user.lastPracticeDate).toDateString() : null;
    
    if (lastDate !== today) {
      user.streak = lastDate === getYesterdayDate() ? user.streak + 1 : 1;
      user.lastPracticeDate = today;
    }
    
    res.json({ 
      success: true, 
      message: `${practiceType} tracked successfully! 🎉`,
      streak: user.streak,
      practice
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to track practice' });
  }
});

app.use('/api/prayertimes', require('./routes/prayerTimes'));

// Get user progress
app.get('/api/users/:userId/progress', (req, res) => {
  try {
    const userId = req.params.userId;
    const userPractices = practices.get(userId) || [];
    const user = users.get(userId) || createUser(userId);
    
    const today = new Date().toDateString();
    const todayPractices = userPractices.filter(p => 
      new Date(p.timestamp).toDateString() === today
    );
    
    // Count practices by type for today
    const todayCounts = todayPractices.reduce((acc, practice) => {
      acc[practice.type] = (acc[practice.type] || 0) + 1;
      return acc;
    }, {});
    
    res.json({
      user: {
        id: user.id,
        streak: user.streak,
        totalPractices: userPractices.length
      },
      today: {
        date: today,
        practices: todayPractices,
        counts: todayCounts,
        prayersCompleted: Object.keys(todayCounts).filter(k => 
          ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].includes(k)
        ).length
      },
      streak: user.streak
    });
    
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Helper function
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🕌 MuslimDaily server running on port ${PORT}`);
  console.log(`💰 COMPLETELY FREE - No costs, no subscriptions`);
  console.log(`🌍 API available at: http://localhost:${PORT}`);
  console.log(`📊 In-memory storage active`);
});