// routes/showtimeRoutes.js - Routes for Showtime operations
const express = require('express');
const router = express.Router();
const {
  getShowtimeById,
  createShowtime,
} = require('../controllers/showtimeController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Public route to get details of a specific showtime (with seats & movie info)
router.get('/:id', getShowtimeById);

// Admin-only route to create a showtime
router.post('/', protect, adminOnly, createShowtime);

module.exports = router;
