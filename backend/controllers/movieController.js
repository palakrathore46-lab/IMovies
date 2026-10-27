// controllers/movieController.js - Handles CRUD operations for movies
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');

// @desc    Get all movies with optional search & genre filter
// @route   GET /api/movies
// @access  Public
const getMovies = async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};

    // Search by title (case-insensitive regex)
    if (search && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by genre (case-insensitive regex)
    if (genre && genre.trim() !== '' && genre.toLowerCase() !== 'all') {
      query.genre = { $regex: genre.trim(), $options: 'i' };
    }

    const movies = await Movie.find(query).sort({ createdAt: -1 });
    res.status(200).json(movies);
  } catch (error) {
    console.error('Get Movies Error:', error);
    res.status(500).json({ message: 'Server error retrieving movies.' });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found.' });
    }
    res.status(200).json(movie);
  } catch (error) {
    console.error('Get Movie By ID Error:', error);
    res.status(500).json({ message: 'Server error retrieving movie details.' });
  }
};

// @desc    Create a new movie
// @route   POST /api/movies
// @access  Private / Admin only
const createMovie = async (req, res) => {
  try {
    const { title, description, genre, language, duration, rating, posterUrl, releaseDate } = req.body;

    // Validation
    if (!title || !description || !genre || !duration || !posterUrl || !releaseDate) {
      return res.status(400).json({ message: 'Please provide all required movie fields.' });
    }

    const movie = await Movie.create({
      title,
      description,
      genre,
      language: language || 'English',
      duration: Number(duration),
      rating: rating ? Number(rating) : 0,
      posterUrl,
      releaseDate,
    });

    res.status(201).json(movie);
  } catch (error) {
    console.error('Create Movie Error:', error);
    res.status(500).json({ message: error.message || 'Server error creating movie.' });
  }
};

// @desc    Update an existing movie
// @route   PUT /api/movies/:id
// @access  Private / Admin only
const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found to update.' });
    }

    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return modified document
      runValidators: true,
    });

    res.status(200).json(updatedMovie);
  } catch (error) {
    console.error('Update Movie Error:', error);
    res.status(500).json({ message: error.message || 'Server error updating movie.' });
  }
};

// @desc    Delete a movie and its related showtimes
// @route   DELETE /api/movies/:id
// @access  Private / Admin only
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found to delete.' });
    }

    // Delete associated showtimes for clean data consistency
    await Showtime.deleteMany({ movie: movie._id });

    // Delete the movie
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Movie and associated showtimes removed successfully.' });
  } catch (error) {
    console.error('Delete Movie Error:', error);
    res.status(500).json({ message: 'Server error deleting movie.' });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};
