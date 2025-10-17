const express = require('express');
const router = express.Router();

// Test route - always works
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Safe registration with dependency checking
router.post('/register', async (req, res) => {
  try {
    // Check if dependencies are available
    if (typeof require('bcryptjs') === 'undefined' || 
        typeof require('jsonwebtoken') === 'undefined') {
      return res.status(503).json({
        success: false,
        error: 'Authentication service temporarily unavailable - dependencies missing'
      });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const { email, password, name } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      name,
      zone: 'SGR01'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'dev-secret-key', 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        zone: user.zone
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed: ' + error.message
    });
  }
});

// Safe login
router.post('/login', async (req, res) => {
  try {
    // Check if dependencies are available
    if (typeof require('bcryptjs') === 'undefined' || 
        typeof require('jsonwebtoken') === 'undefined') {
      return res.status(503).json({
        success: false,
        error: 'Authentication service temporarily unavailable - dependencies missing'
      });
    }

    const bcrypt = require('bcryptjs');
    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid credentials' 
      });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET || 'dev-secret-key', 
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        zone: user.zone
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed: ' + error.message
    });
  }
});

module.exports = router;