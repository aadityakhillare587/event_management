const Booking = require('../models/Booking');
const Event = require('../models/Event');
const User = require('../models/User');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const { eventId, numberOfTickets } = req.body;

    if (!eventId || !numberOfTickets) {
      return res.status(400).json({
        success: false,
        message: 'Please provide event ID and number of tickets',
      });
    }

    const tickets = parseInt(numberOfTickets, 10);
    if (isNaN(tickets) || tickets < 1) {
      return res.status(400).json({
        success: false,
        message: 'Number of tickets must be at least 1',
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check available seats
    if (event.availableSeats < tickets) {
      return res.status(400).json({
        success: false,
        message: `Insufficient seats available. Only ${event.availableSeats} seat(s) remaining.`,
      });
    }

    // Calculate total amount
    const totalAmount = event.price * tickets;

    // Reduce available seats
    event.availableSeats -= tickets;
    await event.save();

    // Create booking
    const booking = await Booking.create({
      user: req.user._id,
      event: event._id,
      numberOfTickets: tickets,
      totalAmount,
      bookingDate: new Date(),
      status: 'Confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('event')
      .populate('user', 'name email');

    res.status(201).json({
      success: true,
      data: populatedBooking,
      message: 'Booking confirmed successfully!',
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating booking',
    });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('event')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get My Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching your bookings',
    });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('user', 'name email')
      .populate('event', 'title date time location price category')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching all bookings',
    });
  }
};

// @desc    Update booking status (Admin can update any; user can cancel their own)
// @route   PUT /api/bookings/:id
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Check authorization: Admin or the booking owner
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking',
      });
    }

    // Regular users can only cancel their booking
    if (!isAdmin && status !== 'Cancelled') {
      return res.status(403).json({
        success: false,
        message: 'Users are only authorized to cancel bookings',
      });
    }

    const previousStatus = booking.status;

    // Handle seat count adjustments when status changes
    if (previousStatus === 'Confirmed' && status === 'Cancelled') {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableSeats += booking.numberOfTickets;
        await event.save();
      }
    } else if (previousStatus === 'Cancelled' && status === 'Confirmed') {
      const event = await Event.findById(booking.event);
      if (event) {
        if (event.availableSeats < booking.numberOfTickets) {
          return res.status(400).json({
            success: false,
            message: 'Cannot restore booking: insufficient seats available',
          });
        }
        event.availableSeats -= booking.numberOfTickets;
        await event.save();
      }
    }

    booking.status = status;
    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate('user', 'name email')
      .populate('event');

    res.status(200).json({
      success: true,
      data: updatedBooking,
      message: `Booking status updated to ${status}`,
    });
  } catch (error) {
    console.error('Update Booking Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating booking',
    });
  }
};

// @desc    Cancel/Delete booking (User can cancel own booking, Admin can cancel/delete any)
// @route   DELETE /api/bookings/:id
// @access  Private
const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    // If confirmed, return seats back to the event
    if (booking.status === 'Confirmed') {
      const event = await Event.findById(booking.event);
      if (event) {
        event.availableSeats += booking.numberOfTickets;
        await event.save();
      }
    }

    // If admin requested hard delete or user cancels:
    // We mark as Cancelled for history or delete
    if (isAdmin && req.query.permanent === 'true') {
      await Booking.findByIdAndDelete(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Booking deleted permanently',
      });
    }

    // Set status to Cancelled
    booking.status = 'Cancelled';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking,
      message: 'Booking has been successfully cancelled',
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error cancelling booking',
    });
  }
};

// @desc    Get dashboard statistics (Admin only)
// @route   GET /api/bookings/stats
// @access  Private/Admin
const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBookings = await Booking.countDocuments();

    // Calculate total revenue from Confirmed bookings
    const revenueAggregate = await Booking.aggregate([
      { $match: { status: 'Confirmed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);

    const totalRevenue =
      revenueAggregate.length > 0 ? revenueAggregate[0].totalRevenue : 0;

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        totalBookings,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error calculating statistics',
    });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getAdminStats,
};

