const Event = require('../models/Event');
const { validationResult, body } = require('express-validator');

exports.eventValidation = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('category').isIn(['Tech', 'Fest', 'Music', 'Sports', 'Workshop', 'Seminar', 'Other']).withMessage('Invalid category'),
    body('college').trim().notEmpty().withMessage('College is required'),
    body('venue').trim().notEmpty().withMessage('Venue is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
    body('totalTickets').isInt({ min: 1 }).withMessage('Total tickets must be at least 1'),
];

// @desc    Get all approved events (public)
// @route   GET /api/events
exports.getEvents = async (req, res, next) => {
    try {
        const { category, college, search, startDate, endDate, page = 1, limit = 12 } = req.query;

        const query = { status: 'approved' };

        if (category) query.category = category;
        if (college) query.college = { $regex: college, $options: 'i' };
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { college: { $regex: search, $options: 'i' } },
            ];
        }
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('organizer', 'name college')
            .sort({ featured: -1, date: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: events,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
exports.getEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizer', 'name email college');

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Create event
// @route   POST /api/events
exports.createEvent = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const eventData = {
            ...req.body,
            organizer: req.user._id,
        };

        // Handle image upload
        if (req.file) {
            eventData.image = req.file.path || req.file.url || `/uploads/${req.file.filename}`;
        }

        const event = await Event.create(eventData);
        await event.populate('organizer', 'name college');

        res.status(201).json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
    try {
        let event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Ensure user is event owner or admin
        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        if (req.file) {
            req.body.image = req.file.path || req.file.url || `/uploads/${req.file.filename}`;
        }

        event = await Event.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).populate('organizer', 'name college');

        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await event.deleteOne();
        res.json({ success: true, message: 'Event deleted' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get organizer's events
// @route   GET /api/events/my/events
exports.getMyEvents = async (req, res, next) => {
    try {
        const events = await Event.find({ organizer: req.user._id })
            .sort({ createdAt: -1 });

        res.json({ success: true, data: events });
    } catch (error) {
        next(error);
    }
};

// @desc    Add coupon to event
// @route   POST /api/events/:id/coupon
exports.addCoupon = async (req, res, next) => {
    try {
        const { code, discountPercent, maxUses } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        event.coupons.push({ code: code.toUpperCase(), discountPercent, maxUses });
        await event.save();

        res.json({ success: true, data: event });
    } catch (error) {
        next(error);
    }
};
