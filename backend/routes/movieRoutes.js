// routes/movieRoutes.js - Routes for Movie catalog operations
const express = require('express');
const router = express.Router();
const {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { getShowtimesByMovie } = require('../controllers/showtimeController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminOnly');

// Public routes
router.get('/', getMovies);
router.get('/:id', getMovieById);

// Nested showtime route for movie details page: GET /api/movies/:id/showtimes
router.get('/:id/showtimes', (req, res, next) => {
  // Pass to showtimeController
  getShowtimesByMovie(req, res, next);
});

// Admin-protected routes
router.post('/', protect, adminOnly, createMovie);
router.put('/:id', protect, adminOnly, updateMovie);
router.delete('/:id', protect, adminOnly, deleteMovie);

module.exports = router;
