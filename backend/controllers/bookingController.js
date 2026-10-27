// controllers/bookingController.js - Handles ticket bookings and cancellations
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');

// @desc    Book movie tickets (with real-time seat conflict validation)
// @route   POST /api/bookings
// @access  Private (Logged-in user)
const createBooking = async (req, res) => {
  try {
    const { showtimeId, seats } = req.body;

    // 1. Input validation
    if (!showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        message: 'Please provide a valid showtimeId and an array of selected seats.',
      });
    }

    // 2. Fetch the showtime from database
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found.' });
    }

    // 3. Real-time seat check: Ensure NONE of the requested seats are already booked
    const conflictingSeats = seats.filter((seat) => showtime.bookedSeats.includes(seat));
    if (conflictingSeats.length > 0) {
      return res.status(400).json({
        message: `Seat(s) ${conflictingSeats.join(', ')} have already been booked. Please choose other seats.`,
      });
    }

    // 4. Calculate total amount
    const totalAmount = showtime.price * seats.length;

    // 5. Add requested seats to the showtime's bookedSeats list
    showtime.bookedSeats.push(...seats);
    await showtime.save();

    // 6. Create booking record in the database
    const booking = await Booking.create({
      user: req.user._id,
      showtime: showtime._id,
      seats,
      totalAmount,
      status: 'confirmed',
    });

    // Populate showtime and movie info before returning response
    const populatedBooking = await Booking.findById(booking._id).populate({
      path: 'showtime',
      populate: { path: 'movie' },
    });

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: error.message || 'Server error while creating booking.' });
  }
};

// @desc    Get bookings of the logged-in user
// @route   GET /api/bookings/my
// @access  Private (Logged-in user)
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({ message: 'Server error retrieving user bookings.' });
  }
};

// @desc    Cancel a booking and release its booked seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner of booking or Admin)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Check if the user owns this booking or is an admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking.' });
    }

    // Check if already cancelled
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'This booking is already cancelled.' });
    }

    // Release the seats from the associated showtime
    const showtime = await Showtime.findById(booking.showtime);
    if (showtime) {
      showtime.bookedSeats = showtime.bookedSeats.filter(
        (seat) => !booking.seats.includes(seat)
      );
      await showtime.save();
    }

    // Update booking status to cancelled
    booking.status = 'cancelled';
    await booking.save();

    res.status(200).json({
      message: 'Booking successfully cancelled and seats released.',
      booking,
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ message: 'Server error cancelling booking.' });
  }
};

// @desc    Get all bookings across the platform (Admin only)
// @route   GET /api/bookings
// @access  Private / Admin only
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email role')
      .populate({
        path: 'showtime',
        populate: { path: 'movie' },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ message: 'Server error retrieving all bookings.' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
