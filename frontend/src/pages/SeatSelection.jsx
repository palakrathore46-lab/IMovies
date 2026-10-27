// src/pages/SeatSelection.jsx - Interactive cinema seat layout & booking confirmation
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// Generate 40 seats: Rows A-E (5 rows) x Columns 1-8 (8 seats per row)
const ROWS = ['A', 'B', 'C', 'D', 'E'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8];

const SeatSelection = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Fetch showtime details (including movie and bookedSeats array)
  const fetchShowtime = useCallback(async () => {
    try {
      const response = await api.get(`/showtimes/${showtimeId}`);
      setShowtime(response.data);
    } catch (err) {
      console.error('Error fetching showtime:', err);
      setError('Failed to load showtime details. Please return to movie page.');
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    fetchShowtime();
  }, [fetchShowtime]);

  // Toggle seat selection
  const handleSeatClick = (seatLabel) => {
    // If seat is already booked, ignore click
    if (showtime.bookedSeats && showtime.bookedSeats.includes(seatLabel)) {
      return;
    }

    if (selectedSeats.includes(seatLabel)) {
      // Unselect seat
      setSelectedSeats(selectedSeats.filter((s) => s !== seatLabel));
    } else {
      // Select seat (limit to 10 per transaction)
      if (selectedSeats.length >= 10) {
        alert('You can select a maximum of 10 seats per booking.');
        return;
      }
      setSelectedSeats([...selectedSeats, seatLabel]);
    }
  };

  // Confirm booking
  const handleConfirmBooking = async () => {
    if (!user) {
      // If user is not logged in, prompt to login
      navigate('/login', { state: { from: `/seat-selection/${showtimeId}` } });
      return;
    }

    if (selectedSeats.length === 0) {
      alert('Please select at least one seat to continue.');
      return;
    }

    setBookingLoading(true);
    setError(null);

    try {
      // Call backend POST /api/bookings
      await api.post('/bookings', {
        showtimeId: showtime._id,
        seats: selectedSeats,
      });

      setSuccessMsg('Booking confirmed successfully! Redirecting to your bookings...');
      setTimeout(() => {
        navigate('/my-bookings');
      }, 1500);
    } catch (err) {
      console.error('Booking Error:', err);
      // Real-time conflict or server error
      const message = err.response?.data?.message || 'Booking failed. Please try again.';
      setError(message);

      // Re-fetch showtime to refresh bookedSeats in case someone else just booked those seats
      await fetchShowtime();
      // Remove any newly booked seats from user's current selection
      setSelectedSeats((prev) =>
        prev.filter((seat) => !showtime.bookedSeats?.includes(seat))
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-warning" role="status" style={{ width: '3rem', height: '3rem' }}>
          <span className="visually-hidden">Loading seating chart...</span>
        </div>
        <p className="mt-3 text-muted">Loading theater seating chart...</p>
      </div>
    );
  }

  if (error && !showtime) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger shadow-sm">{error}</div>
        <Link to="/" className="btn btn-outline-primary mt-3">
          &larr; Back to Home
        </Link>
      </div>
    );
  }

  const bookedList = showtime.bookedSeats || [];
  const totalPrice = selectedSeats.length * showtime.price;

  return (
    <div className="container py-4">
      {/* Header breadcrumb & info */}
      <Link
        to={showtime.movie ? `/movies/${showtime.movie._id}` : '/'}
        className="btn btn-link text-decoration-none ps-0 mb-3 text-secondary"
      >
        &larr; Back to Movie Details
      </Link>

      <div className="card shadow-sm border-0 mb-4 p-3 bg-light">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h4 className="fw-bold mb-1 text-dark">
              {showtime.movie?.title || 'Movie'}
            </h4>
            <p className="text-muted small mb-0">
              🏛 <strong>{showtime.theater}</strong> &bull; 📅 {showtime.date} &bull; ⏰ {showtime.time}
            </p>
          </div>
          <div className="text-end">
            <span className="badge bg-warning text-dark fs-6 px-3 py-2">
              Price: ₹{showtime.price} / ticket
            </span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert-danger shadow-sm alert-dismissible fade show" role="alert">
          <strong>Booking Alert:</strong> {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {successMsg && (
        <div className="alert alert-success shadow-sm" role="alert">
          {successMsg}
        </div>
      )}

      <div className="row g-4">
        {/* Seating Layout Column */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 text-center">
            {/* Cinema Screen Indicator */}
            <div className="mb-4">
              <div
                className="bg-secondary bg-opacity-25 py-2 px-4 rounded-pill text-uppercase fw-bold text-secondary mx-auto shadow-sm"
                style={{ maxWidth: '420px', letterSpacing: '2px', fontSize: '0.85rem' }}
              >
                🎬 SCREEN THIS WAY 🎬
              </div>
              <div
                className="mx-auto mt-2 border-bottom border-warning border-3"
                style={{ maxWidth: '350px' }}
              ></div>
            </div>

            {/* Seat Grid (Rows A-E, Cols 1-8) */}
            <div className="d-inline-block mx-auto my-3">
              {ROWS.map((row) => (
                <div key={row} className="d-flex align-items-center justify-content-center mb-2 gap-2">
                  <span className="fw-bold text-muted me-2" style={{ width: '20px' }}>
                    {row}
                  </span>
                  <div className="d-flex gap-2">
                    {COLS.map((col) => {
                      const seatId = `${row}${col}`;
                      const isBooked = bookedList.includes(seatId);
                      const isSelected = selectedSeats.includes(seatId);

                      let seatClass = 'btn-outline-secondary bg-white text-dark';
                      if (isBooked) {
                        seatClass = 'btn-danger text-white disabled';
                      } else if (isSelected) {
                        seatClass = 'btn-success text-white fw-bold';
                      }

                      return (
                        <button
                          key={seatId}
                          type="button"
                          className={`btn btn-sm ${seatClass} seat-btn`}
                          style={{
                            width: '38px',
                            height: '38px',
                            padding: '0',
                            fontSize: '0.75rem',
                            cursor: isBooked ? 'not-allowed' : 'pointer',
                          }}
                          disabled={isBooked}
                          onClick={() => handleSeatClick(seatId)}
                          title={isBooked ? `Seat ${seatId} (Booked)` : `Seat ${seatId} (Available)`}
                        >
                          {col}
                        </button>
                      );
                    })}
                  </div>
                  <span className="fw-bold text-muted ms-2" style={{ width: '20px' }}>
                    {row}
                  </span>
                </div>
              ))}
            </div>

            {/* Seat Status Legend */}
            <div className="d-flex justify-content-center flex-wrap gap-4 mt-4 pt-3 border-top small">
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block bg-white border border-secondary rounded" style={{ width: '20px', height: '20px' }}></span>
                <span className="text-secondary">Available</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block bg-success rounded" style={{ width: '20px', height: '20px' }}></span>
                <span className="text-secondary">Selected</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="d-inline-block bg-danger rounded" style={{ width: '20px', height: '20px' }}></span>
                <span className="text-secondary">Booked</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar Column */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 p-4 sticky-top" style={{ top: '80px' }}>
            <h5 className="fw-bold text-dark mb-3">Booking Summary</h5>

            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Movie:</span>
                <strong className="text-dark">{showtime.movie?.title}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Theater:</span>
                <span>{showtime.theater}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Date & Time:</span>
                <span>{showtime.date} | {showtime.time}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Ticket Rate:</span>
                <span>₹{showtime.price}</span>
              </div>
            </div>

            {/* Selected Seats info */}
            <div className="mb-3 pb-3 border-bottom">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Selected Seats:</span>
                <strong className="text-primary">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None'}
                </strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Seat Count:</span>
                <strong>{selectedSeats.length}</strong>
              </div>
            </div>

            {/* Total Price */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <span className="fs-5 fw-bold text-dark">Total Amount:</span>
              <span className="fs-4 fw-bold text-success">₹{totalPrice}</span>
            </div>

            {/* Confirm button */}
            {!user ? (
              <div>
                <button
                  className="btn btn-warning w-100 fw-bold py-2 mb-2 shadow-sm"
                  onClick={() =>
                    navigate('/login', { state: { from: `/seat-selection/${showtimeId}` } })
                  }
                >
                  Login to Book Tickets
                </button>
                <p className="text-muted small text-center mb-0">
                  You need an account to book tickets.
                </p>
              </div>
            ) : (
              <button
                className="btn btn-warning w-100 fw-bold py-2 shadow-sm"
                disabled={selectedSeats.length === 0 || bookingLoading}
                onClick={handleConfirmBooking}
              >
                {bookingLoading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Confirming Booking...
                  </span>
                ) : (
                  `Confirm Booking (${selectedSeats.length} Seats)`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelection;
