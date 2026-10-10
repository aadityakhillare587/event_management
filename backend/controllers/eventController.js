const Event = require('../models/Event');
const Booking = require('../models/Booking');

// @desc    Get all events with search, category filter, and date filter
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const { search, category, date } = req.query;

    const query = {};

    // Search keyword in title, description, or location
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { location: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Date filter
    if (date && date.trim() !== '') {
      query.date = date.trim();
    }

    const events = await Event.find(query).sort({ date: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Get Events Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching events',
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Event not found with provided ID',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching event details',
    });
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      date,
      time,
      location,
      category,
      price,
      availableSeats,
      image,
    } = req.body;

    if (
      !title ||
      !description ||
      !date ||
      !time ||
      !location ||
      !category ||
      price === undefined ||
      availableSeats === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required event fields',
      });
    }

    const event = await Event.create({
      title,
      description,
      date,
      time,
      location,
      category,
      price: Number(price),
      availableSeats: Number(availableSeats),
      image:
        image && image.trim() !== ''
          ? image
          : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1200&q=80',
    });

    res.status(201).json({
      success: true,
      data: event,
      message: 'Event created successfully',
    });
  } catch (error) {
    console.error('Create Event Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating event',
    });
  }
};

// @desc    Update an existing event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
  try {
    let event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event = await Event.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: event,
      message: 'Event updated successfully',
    });
  } catch (error) {
    console.error('Update Event Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating event',
    });
  }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Delete associated bookings
    await Booking.deleteMany({ event: req.params.id });

    // Delete the event
    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event and associated bookings deleted successfully',
    });
  } catch (error) {
    console.error('Delete Event Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting event',
    });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};

