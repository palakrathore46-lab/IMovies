// server.js - Entry point for the Express backend
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json()); // Parse incoming JSON request bodies

// Route Imports
const authRoutes = require('./routes/authRoutes');
const movieRoutes = require('./routes/movieRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/showtimes', showtimeRoutes);
app.use('/api/bookings', bookingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'IMovies API is running smoothly' });
});

// Root & API welcome endpoint (lists available resources)
app.get(['/', '/api'], (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the IMovies API',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      movies: {
        getAll: 'GET /api/movies',
        getById: 'GET /api/movies/:id',
        getShowtimes: 'GET /api/movies/:id/showtimes',
        create: 'POST /api/movies (admin)',
        update: 'PUT /api/movies/:id (admin)',
        delete: 'DELETE /api/movies/:id (admin)',
      },
      showtimes: {
        getById: 'GET /api/showtimes/:id',
        create: 'POST /api/showtimes (admin)',
      },
      bookings: {
        create: 'POST /api/bookings (auth)',
        getMy: 'GET /api/bookings/my (auth)',
        cancel: 'PUT /api/bookings/:id/cancel (auth)',
        getAll: 'GET /api/bookings (admin)',
      },
    },
  });
});

// Fallback for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

// Define server PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
