// src/pages/MyBookings.jsx - View user's booked tickets and cancel bookings
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null); // { type: 'success' | 'danger', message: '' }

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setAlertInfo({
        type: 'danger',
        message: 'Failed to load bookings. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle ticket cancellation
  const handleCancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this booking? This will release your reserved seats.'
    );
    if (!confirmCancel) return;

    setCancellingId(bookingId);
    setAlertInfo(null);

    try {
      const response = await api.put(`/bookings/${bookingId}/cancel`);
      setAlertInfo({
        type: 'success',
        message: response.data.message || 'Booking cancelled successfully. Seats have been released.',
      });

      // Update booking status in local state without full reload
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setAlertInfo({
        type: 'danger',
        message: err.response?.data?.message || 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Bookings</h2>
          <p className="text-muted small mb-0">View all your confirmed and past movie ticket reservations</p>
        </div>
        <Link to="/" className="btn btn-warning btn-sm fw-bold shadow-sm">
          + Book More Movies
        </Link>
      </div>

      {/* Dynamic Alert Banner */}
      {alertInfo && (
        <div
          className={`alert alert-${alertInfo.type} alert-dismissible fade show shadow-sm mb-4`}
          role="alert"
        >
          {alertInfo.message}
          <button
            type="button"
            className="btn-close"
            onClick={() => setAlertInfo(null)}
          ></button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading bookings...</span>
          </div>
          <p className="mt-3 text-muted">Retrieving your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <div className="card shadow-sm border-0 text-center py-5 px-3">
          <div className="display-4 text-muted mb-3">🎟️</div>
          <h4 className="fw-bold text-dark mb-2">No Bookings Found</h4>
          <p className="text-secondary mb-4">You have not booked any movie tickets yet.</p>
          <div>
            <Link to="/" className="btn btn-warning fw-bold px-4 shadow-sm">
              Explore Now Showing Movies
            </Link>
          </div>
        </div>
      ) : (
        /* Bookings List */
        <div className="row g-4">
          {bookings.map((booking) => {
            const showtime = booking.showtime;
            const movie = showtime?.movie;
            const isConfirmed = booking.status === 'confirmed';

            return (
              <div key={booking._id} className="col-12 col-md-6 col-lg-6">
                <div className="card shadow-sm border-0 h-100 overflow-hidden">
                  <div className="row g-0 h-100">
                    {/* Movie poster thumbnail */}
                    <div className="col-4 bg-dark">
                      <img
                        src={movie?.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600'}
                        alt={movie?.title || 'Movie'}
                        className="w-100 h-100 object-fit-cover"
                        style={{ minHeight: '180px' }}
                      />
                    </div>

                    {/* Booking Details */}
                    <div className="col-8 p-3 d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <h5 className="fw-bold text-dark mb-0">{movie?.title || 'Movie Title'}</h5>
                          <span
                            className={`badge ${
                              isConfirmed ? 'bg-success' : 'bg-danger'
                            } text-uppercase px-2 py-1`}
                            style={{ fontSize: '0.7rem' }}
                          >
                            {booking.status}
                          </span>
                        </div>

                        <p className="text-muted small mb-2">
                          🏛 {showtime?.theater || 'Cinema Screen'}
                        </p>

                        <div className="bg-light p-2 rounded mb-2 small">
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Date & Time:</span>
                            <strong>{showtime?.date} &bull; {showtime?.time}</strong>
                          </div>
                          <div className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Seats:</span>
                            <span className="badge bg-warning text-dark fw-bold">
                              {booking.seats ? booking.seats.join(', ') : 'N/A'}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <span className="text-muted">Total Paid:</span>
                            <strong className="text-success">₹{booking.totalAmount}</strong>
                          </div>
                        </div>

                        <p className="text-muted small mb-0" style={{ fontSize: '0.75rem' }}>
                          Booked on: {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                          {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Cancel Action Button */}
                      <div className="mt-3 text-end">
                        {isConfirmed ? (
                          <button
                            className="btn btn-outline-danger btn-sm"
                            disabled={cancellingId === booking._id}
                            onClick={() => handleCancelBooking(booking._id)}
                          >
                            {cancellingId === booking._id ? (
                              <span>
                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                Cancelling...
                              </span>
                            ) : (
                              'Cancel Booking'
                            )}
                          </button>
                        ) : (
                          <span className="text-danger small fw-semibold">Cancelled (Seats Released)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
