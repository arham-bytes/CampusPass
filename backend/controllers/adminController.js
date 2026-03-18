const User = require('../models/User');
const Event = require('../models/Event');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
exports.getDashboard = async (req, res, next) => {
    try {
        const [totalUsers, totalEvents, totalBookings, totalRevenue] = await Promise.all([
            User.countDocuments(),
            Event.countDocuments(),
            Booking.countDocuments({ status: { $ne: 'cancelled' } }),
            Payment.aggregate([
                { $match: { status: 'paid' } },
                { $group: { _id: null, total: { $sum: '$amount' } } },
            ]),
        ]);

        const pendingEvents = await Event.countDocuments({ status: 'pending' });
        const recentBookings = await Booking.find()
            .populate('user', 'name email')
            .populate('event', 'title')
            .sort({ createdAt: -1 })
            .limit(10);

        // Category distribution
        const categoryStats = await Event.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        // Monthly revenue (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlyRevenue = await Payment.aggregate([
            { $match: { status: 'paid', createdAt: { $gte: sixMonthsAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalEvents,
                totalBookings,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingEvents,
                recentBookings,
                categoryStats,
                monthlyRevenue,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all events (admin)
// @route   GET /api/admin/events
exports.getAllEvents = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('organizer', 'name email college')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: events,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Approve/Reject event
// @route   PUT /api/admin/events/:id/status
exports.updateEventStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('organizer', 'name email');

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Notify organizer
        sendEmail({
            to: event.organizer.email,
            subject: `Event ${status}: ${event.title}`,
            html: `<p>Your event "<strong>${event.title}</strong>" has been <strong>${status}</strong> by the admin.</p>`,
        });

        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle featured status
// @route   PUT /api/admin/events/:id/feature
exports.toggleFeatured = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        event.featured = !event.featured;
        await event.save();

        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const { role, page = 1, limit = 20 } = req.query;
        const query = {};
        if (role) query.role = role;

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: users,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle
exports.toggleUserStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
exports.getTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const total = await Payment.countDocuments();
        const payments = await Payment.find()
            .populate('user', 'name email')
            .populate('event', 'title')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: payments,
            pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        next(error);
    }
};

// Import sendEmail at the top
const sendEmail = require('../utils/sendEmail');
