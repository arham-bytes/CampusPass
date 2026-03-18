const express = require('express');
const router = express.Router();
const {
    getDashboard,
    getAllEvents,
    updateEventStatus,
    toggleFeatured,
    getUsers,
    toggleUserStatus,
    getTransactions,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/events', getAllEvents);
router.put('/events/:id/status', updateEventStatus);
router.put('/events/:id/feature', toggleFeatured);
router.get('/users', getUsers);
router.put('/users/:id/toggle', toggleUserStatus);
router.get('/transactions', getTransactions);

module.exports = router;
