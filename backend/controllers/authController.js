// controllers/authController.js - Handles user registration, login, and profile fetching
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT token with 7 days expiration
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields (name, email, password).' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // 2. Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    // 3. Create user (password is automatically hashed by pre-save hook)
    const user = await User.create({
      name,
      email,
      password,
      role: 'user', // Default role is user
    });

    // 4. Return user info and JWT token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: error.message || 'Server error during registration.' });
  }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    // 2. Find user by email
    const user = await User.findOne({ email });

    // 3. Verify password match
    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: error.message || 'Server error during login.' });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private (Requires token)
const getMe = async (req, res) => {
  try {
    // req.user was attached by auth middleware
    res.status(200).json(req.user);
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({ message: 'Server error retrieving user profile.' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
