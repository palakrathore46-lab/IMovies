// src/pages/MovieDetails.jsx - Shows movie synopsis, details, and list of upcoming showtimes
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';

const MovieDetails = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('All');

  useEffect(() => {
    const fetchMovieAndShowtimes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch movie details and its showtimes in parallel
        const [movieRes, showtimesRes] = await Promise.all([
          api.get(`/movies/${id}`),
          api.get(`/movies/${id}/showtimes`),
        ]);

        setMovie(movieRes.data);
        setShowtimes(showtimesRes.data);
      } catch (err) {
        console.error('Error loading movie details:', err);
        setError('Failed to load movie details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieAndShowtimes();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading movie details...</span>
        </div>
        <p className="mt-3 text-muted">Loading movie & showtime information...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm">
          {error || 'Movie not found.'}
        </div>
        <Link to="/" className="btn btn-outline-primary mt-3">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  // Extract unique dates from showtimes for date filter tabs
  const availableDates = ['All', ...Array.from(new Set(showtimes.map((st) => st.date)))];

  // Filter showtimes based on selected date tab
  const filteredShowtimes =
    selectedDate === 'All'
      ? showtimes
      : showtimes.filter((st) => st.date === selectedDate);

  return (
    <div className="container py-4">
      {/* Back button */}
      <Link to="/" className="btn btn-link text-decoration-none ps-0 mb-3 text-secondary">
        &larr; Back to All Movies
      </Link>

      {/* Movie Information Card */}
      <div className="card shadow-sm border-0 mb-5 overflow-hidden">
        <div className="row g-0">
          {/* Poster Column */}
          <div className="col-md-4 bg-dark text-center">
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="img-fluid w-100 h-100 object-fit-cover"
              style={{ maxHeight: '500px' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
              }}
            />
          </div>

          {/* Details Column */}
          <div className="col-md-8 p-4 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <h2 className="fw-bold mb-0 text-dark">{movie.title}</h2>
                <span className="badge bg-warning text-dark fs-6 px-3 py-2 shadow-sm">
                  ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'} / 10
                </span>
              </div>

              <div className="d-flex flex-wrap gap-2 mb-3">
                <span className="badge bg-secondary">{movie.language}</span>
                <span className="badge bg-info text-dark">{movie.genre}</span>
                <span className="badge bg-light text-dark border">⏱ {movie.duration} minutes</span>
                <span className="badge bg-light text-dark border">📅 Released: {movie.releaseDate}</span>
              </div>

              <h5 className="fw-bold text-secondary mt-3">About the Movie</h5>
              <p className="text-secondary lead fs-6" style={{ lineHeight: '1.6' }}>
                {movie.description}
              </p>
            </div>

            <div className="border-top pt-3 mt-3 text-muted small">
              Instant e-tickets with real-time seat availability &bull; Cancellation available up to showtime
            </div>
          </div>
        </div>
      </div>

      {/* Showtimes Section */}
      <div className="mb-4">
        <h3 className="fw-bold text-dark mb-3">Available Showtimes</h3>

        {/* Date Filter Tabs */}
        {availableDates.length > 1 && (
          <div className="d-flex flex-wrap gap-2 mb-4">
            {availableDates.map((date) => (
              <button
                key={date}
                className={`btn btn-sm ${
                  selectedDate === date
                    ? 'btn-warning fw-bold text-dark shadow-sm'
                    : 'btn-outline-secondary'
                }`}
                onClick={() => setSelectedDate(date)}
              >
                {date === 'All' ? 'All Dates' : date}
              </button>
            ))}
          </div>
        )}

        {/* Showtimes List */}
        {filteredShowtimes.length === 0 ? (
          <div className="alert alert-info text-center py-4 shadow-sm">
            <h5>No showtimes currently scheduled for this date.</h5>
            <p className="mb-0 text-muted">Please check back soon or try selecting another date.</p>
          </div>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {filteredShowtimes.map((st) => {
              const availableSeatCount = st.totalSeats - (st.bookedSeats ? st.bookedSeats.length : 0);
              const isSoldOut = availableSeatCount <= 0;

              return (
                <div key={st._id} className="col">
                  <div className="card h-100 border shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-dark">{st.theater}</h6>
                      <span className="badge bg-light text-success border border-success fw-bold">
                        ₹{st.price}
                      </span>
                    </div>

                    <p className="text-muted small mb-2">
                      📅 <strong>{st.date}</strong> &bull; ⏰ <strong>{st.time}</strong>
                    </p>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                      <span className={`small ${isSoldOut ? 'text-danger fw-bold' : 'text-success'}`}>
                        {isSoldOut ? 'Sold Out' : `${availableSeatCount} of ${st.totalSeats} seats left`}
                      </span>

                      {isSoldOut ? (
                        <button className="btn btn-secondary btn-sm" disabled>
                          Sold Out
                        </button>
                      ) : (
                        <Link
                          to={`/seat-selection/${st._id}`}
                          className="btn btn-warning btn-sm fw-bold px-3 shadow-sm"
                        >
                          Select Seats &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
