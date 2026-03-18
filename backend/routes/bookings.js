const express = require('express');
const router = express.Router();
const {
    createBooking,
    getMyBookings,
    getEventBookings,
    verifyTicket,
    getBooking,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/event/:eventId', protect, authorize('organizer', 'admin'), getEventBookings);
router.post('/verify/:ticketId', protect, authorize('organizer', 'admin'), verifyTicket);
router.get('/:id', protect, getBooking);

module.exports = router;
