const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  getAdminStats,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Specific endpoints before parameterized endpoints
router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/stats', protect, admin, getAdminStats);
router.get('/', protect, admin, getAllBookings);
router.put('/:id', protect, updateBookingStatus);
router.delete('/:id', protect, deleteBooking);

module.exports = router;

