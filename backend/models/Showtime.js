// models/Showtime.js - Mongoose model for Movie Showtimes
const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema(
  {
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Please reference a movie'],
    },
    theater: {
      type: String,
      required: [true, 'Please provide theater name or screen number'],
      trim: true,
    },
    date: {
      type: String, // Stored as YYYY-MM-DD for straightforward comparisons
      required: [true, 'Please provide showtime date (YYYY-MM-DD)'],
    },
    time: {
      type: String, // e.g. "10:30 AM", "02:15 PM", "06:00 PM"
      required: [true, 'Please provide showtime time'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide ticket price'],
    },
    totalSeats: {
      type: Number,
      default: 40,
    },
    bookedSeats: {
      type: [String], // Array of booked seat identifiers, e.g. ["A1", "A2", "B5"]
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Showtime = mongoose.model('Showtime', showtimeSchema);
module.exports = Showtime;
