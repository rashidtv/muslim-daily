const express = require('express');
const cors = require('cors');
const prayerNotificationsRoutes = require('./routes/prayerNotifications');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ==================== IN-MEMORY STORAGE ====================
const users = new Map();
const practices = new Map();
const authUsers = new Map(); // email -> user data
const userTokens = new Map(); // token -> user email

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

// Helper function to generate simple tokens
const generateToken = () => 'token_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);

// Helper function for dates
function getYesterdayDate() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toDateString();
}

// Enhanced startup logging
console.log('🚀 Muslim Daily Backend Starting...');
console.log('📅 Startup Time:', new Date().toISOString());
console.log('💰 COMPLETELY FREE - No costs, no subscriptions');
console.log('🔐 In-memory user storage active');

// ==================== HEALTH MONITORING ENDPOINTS ====================

// Health check endpoint 1 - Basic
app.get('/api/health1', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'Muslim Daily Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    storage: 'in-memory'
  });
});

// Health check endpoint 2 - Memory usage
app.get('/api/health2', (req, res) => {
  const used = process.memoryUsage();
  res.json({ 
    status: 'healthy',
    memory: {
      rss: `${Math.round(used.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)} MB`,
      external: `${Math.round(used.external / 1024 / 1024)} MB`
    },
    uptime: `${Math.round(process.uptime())} seconds`,
    timestamp: new Date().toISOString(),
    users: authUsers.size,
    sessions: userTokens.size
  });
});

// Health check endpoint 3 - Detailed stats
app.get('/api/health3', (req, res) => {
  const userStats = {
    totalUsers: authUsers.size,
    activeSessions: userTokens.size,
    totalPractices: Array.from(practices.values()).reduce((acc, userPractices) => acc + userPractices.length, 0),
    serverUptime: `${Math.round(process.uptime())} seconds`
  };

  res.json({ 
    status: 'healthy',
    stats: userStats,
    timestamp: new Date().toISOString(),
    service: 'Muslim Daily API - In Memory Edition'
  });
});

// Warmup endpoint - Simulates real API call
app.get('/api/warmup', async (req, res) => {
  try {
    // Simulate some processing
    const userCount = authUsers.size;
    const practiceCount = Array.from(practices.values()).reduce((acc, userPractices) => acc + userPractices.length, 0);
    
    res.json({ 
      status: 'warmed up',
      users: userCount,
      practices: practiceCount,
      timestamp: new Date().toISOString(),
      message: 'Muslim Daily backend is ready to handle requests'
    });
  } catch (error) {
    res.json({ 
      status: 'warming up',
      error: error.message,
      timestamp: new Date().toISOString(),
      message: 'Backend is starting up...'
    });
  }
});

// Simple ping endpoint
app.get('/api/ping', (req, res) => {
  res.json({ 
    pong: true,
    timestamp: new Date().toISOString(),
    service: 'Muslim Daily API',
    version: '1.0.0',
    message: 'Alhamdulillah! Serving the Muslim community for free!'
  });
});

// ==================== EXISTING ROUTES (KEEP ALL YOUR CURRENT CODE) ====================

// Root endpoint
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
      'User authentication',
      'Completely FREE forever'
    ],
    stats: {
      totalUsers: authUsers.size,
      activeSessions: userTokens.size,
      serverTime: new Date().toISOString()
    },
    healthEndpoints: [
      '/api/health1',
      '/api/health2', 
      '/api/health3',
      '/api/warmup',
      '/api/ping'
    ]
  });
});

// Health check (existing)
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Muslim Daily API is running!',
    timestamp: new Date().toISOString(),
    usersCount: authUsers.size,
    sessionsCount: userTokens.size
  });
});

// ==================== ALL YOUR EXISTING AUTH ROUTES ====================
// KEEP ALL YOUR EXISTING CODE FROM HERE...

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, password, and name are required' 
      });
    }

    // Basic email validation
    if (!email.includes('@')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email format' 
      });
    }

    // Check if user already exists
    if (authUsers.has(email.toLowerCase())) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Create user
    const userId = 'user_' + Date.now();
    const user = {
      id: userId,
      email: email.toLowerCase(),
      name: name,
      password: password, // In production, hash this with bcryptjs
      zone: 'SGR01',
      location: {
        latitude: null,
        longitude: null,
        autoDetected: false
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      prayerProgress: {
        fajr: [],
        dhuhr: [],
        asr: [],
        maghrib: [],
        isha: []
      }
    };

    // Store user
    authUsers.set(email.toLowerCase(), user);
    
    // Generate token
    const token = generateToken();
    userTokens.set(token, email.toLowerCase());

    console.log(`✅ New user registered: ${email}`);

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        zone: user.zone,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Find user
    const user = authUsers.get(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    
    // Generate new token
    const token = generateToken();
    userTokens.set(token, email.toLowerCase());

    console.log(`✅ User logged in: ${email}`);

    res.json({
      success: true,
      token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        zone: user.zone,
        location: user.location
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Get current user
app.get('/api/auth/me', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const userEmail = userTokens.get(token);
    if (!userEmail) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const user = authUsers.get(userEmail);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        zone: user.zone,
        location: user.location
      }
    });

  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
});

// Auth test endpoint
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    usersCount: authUsers.size,
    activeSessions: userTokens.size,
    timestamp: new Date().toISOString()
  });
});

// ==================== USER PROFILE ROUTES ====================

// Update user location
app.put('/api/user/location', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const userEmail = userTokens.get(token);
    if (!userEmail) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const user = authUsers.get(userEmail);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const { location, zone } = req.body;
    
    if (location) user.location = location;
    if (zone) user.zone = zone;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        zone: user.zone,
        location: user.location
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update location' 
    });
  }
});

// Track prayer for authenticated user
app.post('/api/user/prayer', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const userEmail = userTokens.get(token);
    if (!userEmail) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const user = authUsers.get(userEmail);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    const { prayer, completed, timestamp } = req.body;
    
    if (!prayer) {
      return res.status(400).json({ 
        success: false, 
        error: 'Prayer type is required' 
      });
    }

    const prayerTime = new Date(timestamp || new Date());

    if (completed) {
      // Add to prayer progress
      if (!user.prayerProgress[prayer]) {
        user.prayerProgress[prayer] = [];
      }
      user.prayerProgress[prayer].push(prayerTime);
    } else {
      // Remove from prayer progress (most recent entry)
      if (user.prayerProgress[prayer] && user.prayerProgress[prayer].length > 0) {
        user.prayerProgress[prayer].pop();
      }
    }

    res.json({
      success: true,
      prayerProgress: user.prayerProgress,
      message: `Prayer ${prayer} ${completed ? 'completed' : 'unmarked'} successfully`
    });

  } catch (error) {
    console.error('Prayer tracking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update prayer' 
    });
  }
});

// Get user prayer progress
app.get('/api/user/progress', (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided' 
      });
    }

    const userEmail = userTokens.get(token);
    if (!userEmail) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid token' 
      });
    }

    const user = authUsers.get(userEmail);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      prayerProgress: user.prayerProgress,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        zone: user.zone
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get prayer progress' 
    });
  }
});

app.use('/api/notifications', prayerNotificationsRoutes);

// ==================== EXISTING PRAYER TIMES ROUTES ====================

// Import prayer times routes
const prayerTimesRoutes = require('./routes/prayerTimes');
app.use('/api/prayertimes', prayerTimesRoutes);

// Prayer times endpoint (legacy)
app.get('/api/prayer-times/:zone?', async (req, res) => {
  try {
    const zone = req.params.zone || 'WLY01'; // Default to KL
    
    // Mock prayer times
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

// ==================== EXISTING PRACTICE TRACKING ROUTES ====================

// Track practice endpoint (legacy)
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

// Get user progress (legacy)
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

// ==================== GRACEFUL SHUTDOWN HANDLING ====================

process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  console.log(`💾 Final stats: ${authUsers.size} users, ${userTokens.size} sessions`);
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  console.log(`💾 Final stats: ${authUsers.size} users, ${userTokens.size} sessions`);
  process.exit(0);
});

// ==================== SERVER START ====================

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🕌 MuslimDaily server running on port ${PORT}`);
  console.log(`💰 COMPLETELY FREE - No costs, no subscriptions`);
  console.log(`🌍 API available at: http://localhost:${PORT}`);
  console.log(`🔐 AUTH ENABLED - In-memory user storage active`);
  console.log(`📊 Stats: ${authUsers.size} users, ${userTokens.size} active sessions`);
  console.log(`🏥 Health monitoring endpoints ready for UptimeRobot`);
  console.log(`📋 Available health endpoints:`);
  console.log(`   GET  /api/health1`);
  console.log(`   GET  /api/health2`);
  console.log(`   GET  /api/health3`);
  console.log(`   GET  /api/warmup`);
  console.log(`   GET  /api/ping`);
});