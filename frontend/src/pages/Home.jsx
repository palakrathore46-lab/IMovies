// src/pages/Home.jsx - Home page with hero banner, search, genre filter, and movie cards grid
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const GENRES = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Crime', 'Animation', 'Biography'];

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  // Fetch movies whenever search term or genre filter changes
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedGenre !== 'All') params.genre = selectedGenre;

        const response = await api.get('/movies', { params });
        setMovies(response.data);
      } catch (err) {
        console.error('Error fetching movies:', err);
        setError('Failed to load movies. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input slightly for smooth typing
    const timer = setTimeout(() => {
      fetchMovies();
    }, 250);

    return () => clearTimeout(timer);
  }, [search, selectedGenre]);

  return (
    <div className="container py-4">
      {/* Hero Banner */}
      <div className="p-4 p-md-5 mb-4 rounded-3 text-white bg-dark border border-secondary border-opacity-50 text-center shadow">
        <h1 className="display-5 fw-bold">
          Book Your Next <span className="text-warning">Blockbuster</span>
        </h1>
        <p className="lead text-light text-opacity-75 mb-3">
          Experience cinema like never before. Real-time seat selection, instant confirmations, zero hassle.
        </p>
        <span className="badge bg-warning text-dark px-3 py-2 fs-6">
          🎬 Now Showing in Theaters Across City
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="row g-3 mb-4 align-items-center bg-light p-3 rounded-3 shadow-sm border">
        {/* Search input */}
        <div className="col-12 col-md-7">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">🔍</span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search movie title (e.g. Inception, Dark Knight)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="btn btn-outline-secondary"
                type="button"
                onClick={() => setSearch('')}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Genre dropdown */}
        <div className="col-12 col-md-5">
          <div className="d-flex align-items-center gap-2">
            <label className="fw-semibold text-secondary mb-0 text-nowrap">Genre:</label>
            <select
              className="form-select"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
            >
              {GENRES.map((genre) => (
                <option key={genre} value={genre}>
                  {genre === 'All' ? 'All Genres' : genre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="alert alert-danger text-center shadow-sm" role="alert">
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading movies...</span>
          </div>
          <p className="mt-3 text-muted">Fetching latest releases...</p>
        </div>
      ) : movies.length === 0 ? (
        /* Empty results state */
        <div className="text-center py-5 bg-white rounded-3 shadow-sm border">
          <h4 className="text-muted mb-2">No movies found</h4>
          <p className="text-secondary mb-3">Try adjusting your search terms or genre filter.</p>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedGenre('All');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Movie Cards Grid */
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 g-4">
          {movies.map((movie) => (
            <div key={movie._id} className="col">
              <div className="card h-100 shadow-sm border-0 movie-card transition-hover">
                {/* Movie Poster */}
                <div className="position-relative overflow-hidden" style={{ height: '380px' }}>
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="card-img-top w-100 h-100 object-fit-cover"
                    onError={(e) => {
                      // Fallback image if poster fails to load
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
                    }}
                  />
                  {/* Rating Badge */}
                  <span className="position-absolute top-0 end-0 m-2 badge bg-dark text-warning p-2 fs-6 shadow">
                    ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}
                  </span>
                </div>

                {/* Card Body */}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title fw-bold text-dark mb-1">{movie.title}</h5>
                  <p className="text-muted small mb-2">
                    <span className="badge bg-secondary me-2">{movie.language}</span>
                    <span>⏱ {movie.duration} mins</span>
                  </p>
                  <p className="badge bg-light text-dark border align-self-start mb-2">
                    {movie.genre}
                  </p>
                  <p className="card-text text-secondary small flex-grow-1">
                    {movie.description.length > 110
                      ? `${movie.description.substring(0, 110)}...`
                      : movie.description}
                  </p>

                  {/* Booking CTA Button */}
                  <Link
                    to={`/movies/${movie._id}`}
                    className="btn btn-warning w-100 fw-bold mt-2 shadow-sm"
                  >
                    View Showtimes & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
