// src/pages/AdminDashboard.jsx - Admin management panel for movies, showtimes, and platform bookings
import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('movies'); // 'movies' | 'showtimes' | 'bookings'
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'danger', message: '' }

  // New Movie Form State
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: '',
    language: 'English',
    duration: '',
    rating: '',
    posterUrl: '',
    releaseDate: '',
  });

  // New Showtime Form State
  const [showtimeForm, setShowtimeForm] = useState({
    movie: '',
    theater: '',
    date: '',
    time: '06:00 PM',
    price: '',
    totalSeats: 40,
  });

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [moviesRes, bookingsRes] = await Promise.all([
        api.get('/movies'),
        api.get('/bookings'),
      ]);
      setMovies(moviesRes.data);
      setBookings(bookingsRes.data);
      if (moviesRes.data.length > 0) {
        setShowtimeForm((prev) => (prev.movie ? prev : { ...prev, movie: moviesRes.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setAlert({ type: 'danger', message: 'Failed to load dashboard data.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Add Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      const response = await api.post('/movies', movieForm);
      setAlert({ type: 'success', message: `Movie "${response.data.title}" added successfully!` });
      setMovieForm({
        title: '',
        description: '',
        genre: '',
        language: 'English',
        duration: '',
        rating: '',
        posterUrl: '',
        releaseDate: '',
      });
      loadData();
    } catch (err) {
      console.error('Error adding movie:', err);
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to add movie.' });
    }
  };

  // Handle Delete Movie
  const handleDeleteMovie = async (movieId, movieTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${movieTitle}"? This will also remove all its showtimes.`
    );
    if (!confirmDelete) return;

    setAlert(null);
    try {
      await api.delete(`/movies/${movieId}`);
      setAlert({ type: 'success', message: `Movie "${movieTitle}" deleted successfully.` });
      setMovies(movies.filter((m) => m._id !== movieId));
    } catch (err) {
      console.error('Error deleting movie:', err);
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to delete movie.' });
    }
  };

  // Handle Add Showtime
  const handleAddShowtime = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!showtimeForm.movie) {
      setAlert({ type: 'danger', message: 'Please select a movie first.' });
      return;
    }

    try {
      await api.post('/showtimes', showtimeForm);
      setAlert({ type: 'success', message: 'Showtime created successfully!' });
      setShowtimeForm({
        movie: movies.length > 0 ? movies[0]._id : '',
        theater: '',
        date: '',
        time: '06:00 PM',
        price: '',
        totalSeats: 40,
      });
      loadData();
    } catch (err) {
      console.error('Error creating showtime:', err);
      setAlert({ type: 'danger', message: err.response?.data?.message || 'Failed to create showtime.' });
    }
  };

  return (
    <div className="container py-4">
      {/* Dashboard Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            🛡️ Admin <span className="text-warning">Dashboard</span>
          </h2>
          <p className="text-muted small mb-0">
            Manage movie listings, schedule theater showtimes, and monitor all platform bookings
          </p>
        </div>
      </div>

      {/* Global Alert Notification */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible fade show shadow-sm`} role="alert">
          {alert.message}
          <button type="button" className="btn-close" onClick={() => setAlert(null)}></button>
        </div>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading dashboard data...</span>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <ul className="nav nav-pills mb-4 bg-light p-2 rounded-3 border">
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'movies' ? 'active bg-dark text-warning' : 'text-secondary'}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 Movies ({movies.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'showtimes' ? 'active bg-dark text-warning' : 'text-secondary'}`}
            onClick={() => setActiveTab('showtimes')}
          >
            ⏰ Add Showtime
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link fw-semibold ${activeTab === 'bookings' ? 'active bg-dark text-warning' : 'text-secondary'}`}
            onClick={() => setActiveTab('bookings')}
          >
            📋 All Bookings ({bookings.length})
          </button>
        </li>
      </ul>

      {/* Tab 1: Movies Management */}
      {activeTab === 'movies' && (
        <div>
          {/* Add New Movie Form Card */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-dark text-white py-3">
              <h5 className="mb-0 fw-bold">➕ Add New Movie</h5>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleAddMovie}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Movie Title</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Gladiator II"
                      required
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Genre(s)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Action, Drama"
                      required
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Language</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. English, Hindi"
                      required
                      value={movieForm.language}
                      onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 148"
                      required
                      min="1"
                      value={movieForm.duration}
                      onChange={(e) => setMovieForm({ ...movieForm, duration: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">IMDb Rating (0 - 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-control"
                      placeholder="e.g. 8.4"
                      required
                      min="0"
                      max="10"
                      value={movieForm.rating}
                      onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Release Date</label>
                    <input
                      type="date"
                      className="form-control"
                      required
                      value={movieForm.releaseDate}
                      onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold small">Poster Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      placeholder="https://..."
                      required
                      value={movieForm.posterUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Movie Description / Synopsis</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Enter a brief plot synopsis..."
                      required
                      value={movieForm.description}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                    ></textarea>
                  </div>
                </div>

                <div className="mt-4 text-end">
                  <button type="submit" className="btn btn-warning fw-bold px-4 shadow-sm">
                    Save Movie to Catalog
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Current Movies List */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 fw-bold text-dark">Current Movies in Catalog</h5>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Poster</th>
                    <th>Title</th>
                    <th>Genre</th>
                    <th>Language</th>
                    <th>Duration</th>
                    <th>Rating</th>
                    <th>Release Date</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((m) => (
                    <tr key={m._id}>
                      <td>
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="rounded object-fit-cover shadow-sm"
                          style={{ width: '45px', height: '60px' }}
                        />
                      </td>
                      <td className="fw-bold">{m.title}</td>
                      <td>
                        <span className="badge bg-light text-dark border">{m.genre}</span>
                      </td>
                      <td>{m.language}</td>
                      <td>{m.duration} mins</td>
                      <td>
                        <span className="badge bg-warning text-dark">⭐ {m.rating}</span>
                      </td>
                      <td className="small text-muted">{m.releaseDate}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteMovie(m._id, m.title)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Add Showtime */}
      {activeTab === 'showtimes' && (
        <div className="card shadow-sm border-0 p-4">
          <h5 className="fw-bold text-dark mb-3">➕ Schedule New Movie Showtime</h5>
          <p className="text-muted small mb-4">
            Create showtimes for movies currently registered in your catalog
          </p>

          <form onSubmit={handleAddShowtime}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold small">Select Movie</label>
                <select
                  className="form-select"
                  required
                  value={showtimeForm.movie}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, movie: e.target.value })}
                >
                  <option value="">-- Choose a Movie --</option>
                  {movies.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.title} ({m.language})
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold small">Theater / Screen Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. PVR Forum Mall - Screen 2"
                  required
                  value={showtimeForm.theater}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, theater: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Date</label>
                <input
                  type="date"
                  className="form-control"
                  required
                  value={showtimeForm.date}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Time Slot</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. 02:30 PM"
                  required
                  value={showtimeForm.time}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, time: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label fw-semibold small">Ticket Price (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="e.g. 250"
                  required
                  min="50"
                  value={showtimeForm.price}
                  onChange={(e) => setShowtimeForm({ ...showtimeForm, price: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-4 text-end">
              <button type="submit" className="btn btn-warning fw-bold px-4 shadow-sm">
                Publish Showtime
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: All Platform Bookings */}
      {activeTab === 'bookings' && (
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white py-3">
            <h5 className="mb-0 fw-bold text-dark">All Platform Bookings</h5>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Movie</th>
                  <th>Theater & Schedule</th>
                  <th>Seats</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Booked On</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No bookings recorded on the platform yet.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="small font-monospace text-muted">{b._id.slice(-6)}</td>
                      <td>
                        <strong>{b.user?.name || 'User'}</strong>
                        <div className="small text-muted">{b.user?.email}</div>
                      </td>
                      <td className="fw-semibold">{b.showtime?.movie?.title || 'Unknown Movie'}</td>
                      <td className="small">
                        <div>{b.showtime?.theater}</div>
                        <div className="text-muted">
                          {b.showtime?.date} &bull; {b.showtime?.time}
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-warning text-dark fw-bold">
                          {b.seats ? b.seats.join(', ') : 'None'}
                        </span>
                      </td>
                      <td className="fw-bold text-success">₹{b.totalAmount}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === 'confirmed' ? 'bg-success' : 'bg-danger'
                          } text-uppercase`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
