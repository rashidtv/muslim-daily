const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  zone: { 
    type: String, 
    default: 'SGR01' 
  },
  location: {
    latitude: Number,
    longitude: Number,
    autoDetected: { type: Boolean, default: false }
  },
  prayerProgress: {
    fajr: [{ type: Date }],
    dhuhr: [{ type: Date }],
    asr: [{ type: Date }],
    maghrib: [{ type: Date }],
    isha: [{ type: Date }]
  },
  settings: {
    notifications: { type: Boolean, default: true },
    sound: { type: Boolean, default: true },
    theme: { type: String, default: 'light' }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', userSchema);