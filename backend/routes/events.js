const express = require('express');
const router = express.Router();
const {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    getMyEvents,
    addCoupon,
    eventValidation,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Public routes
router.get('/', getEvents);
router.get('/my/events', protect, authorize('organizer', 'admin'), getMyEvents);
router.get('/:id', getEvent);

// Protected routes (organizer/admin)
router.post('/', protect, authorize('organizer', 'admin'), upload.single('image'), eventValidation, createEvent);
router.put('/:id', protect, authorize('organizer', 'admin'), upload.single('image'), updateEvent);
router.delete('/:id', protect, authorize('organizer', 'admin'), deleteEvent);
router.post('/:id/coupon', protect, authorize('organizer', 'admin'), addCoupon);

module.exports = router;
