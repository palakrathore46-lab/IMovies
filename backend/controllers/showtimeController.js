// controllers/showtimeController.js - Handles showtimes for movies
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

// @desc    Get all showtimes for a specific movie
// @route   GET /api/movies/:id/showtimes
// @access  Public
const getShowtimesByMovie = async (req, res) => {
  try {
    const movieId = req.params.id;

    // Verify movie exists
    const movieExists = await Movie.findById(movieId);
    if (!movieExists) {
      return res.status(404).json({ message: 'Movie not found.' });
    }

    // Find showtimes for this movie, sorted by date and time
    const showtimes = await Showtime.find({ movie: movieId }).sort({ date: 1, time: 1 });
    res.status(200).json(showtimes);
  } catch (error) {
    console.error('Get Showtimes By Movie Error:', error);
    res.status(500).json({ message: 'Server error retrieving showtimes for this movie.' });
  }
};

// @desc    Get single showtime by ID (includes populated movie info)
// @route   GET /api/showtimes/:id
// @access  Public
const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id).populate('movie');
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found.' });
    }
    res.status(200).json(showtime);
  } catch (error) {
    console.error('Get Showtime By ID Error:', error);
    res.status(500).json({ message: 'Server error retrieving showtime details.' });
  }
};

// @desc    Create a new showtime for a movie
// @route   POST /api/showtimes
// @access  Private / Admin only
const createShowtime = async (req, res) => {
  try {
    const { movie, theater, date, time, price, totalSeats } = req.body;

    // Validation
    if (!movie || !theater || !date || !time || !price) {
      return res.status(400).json({
        message: 'Please provide all required showtime fields (movie, theater, date, time, price).',
      });
    }

    // Ensure referenced movie exists
    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ message: 'The referenced movie does not exist.' });
    }

    const showtime = await Showtime.create({
      movie,
      theater,
      date,
      time,
      price: Number(price),
      totalSeats: totalSeats ? Number(totalSeats) : 40,
      bookedSeats: [],
    });

    res.status(201).json(showtime);
  } catch (error) {
    console.error('Create Showtime Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating showtime.' });
  }
};

module.exports = {
  getShowtimesByMovie,
  getShowtimeById,
  createShowtime,
};
