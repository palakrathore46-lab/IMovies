// models/Movie.js - Mongoose model for Movies
const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a movie title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a movie description'],
    },
    genre: {
      type: String,
      required: [true, 'Please provide movie genre(s)'], // e.g. "Action, Sci-Fi"
    },
    language: {
      type: String,
      required: [true, 'Please provide movie language'],
      default: 'English',
    },
    duration: {
      type: Number,
      required: [true, 'Please provide duration in minutes'], // e.g. 148
    },
    rating: {
      type: Number,
      required: [true, 'Please provide movie rating (e.g. 8.5)'],
      default: 0,
    },
    posterUrl: {
      type: String,
      required: [true, 'Please provide a poster image URL'],
    },
    releaseDate: {
      type: String, // String representation (YYYY-MM-DD) for simple date handling
      required: [true, 'Please provide a release date'],
    },
  },
  {
    timestamps: true,
  }
);

const Movie = mongoose.model('Movie', movieSchema);
module.exports = Movie;
