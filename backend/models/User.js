const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: true,
    minlength: 6
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
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    autoDetected: { type: Boolean, default: false }
  },
  prayerProgress: {
    fajr: [{ type: Date }],
    dhuhr: [{ type: Date }],
    asr: [{ type: Date }],
    maghrib: [{ type: Date }],
    isha: [{ type: Date }]
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);