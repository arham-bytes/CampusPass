const crypto = require('crypto');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const generateQR = require('../utils/generateQR');
const sendEmail = require('../utils/sendEmail');

// @desc    Book a ticket
// @route   POST /api/bookings
exports.createBooking = async (req, res, next) => {
    try {
        const { eventId, couponCode } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Event is not approved yet' });
        }

        // Check available tickets
        if (event.ticketsSold >= event.totalTickets) {
            return res.status(400).json({ success: false, message: 'Event is sold out' });
        }

        // Prevent duplicate bookings
        const existingBooking = await Booking.findOne({ event: eventId, user: req.user._id });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: 'You have already booked this event' });
        }

        // Calculate price with coupon
        let totalAmount = event.price;
        let couponUsed = '';

        if (couponCode && event.price > 0) {
            const coupon = event.coupons.find(
                (c) => c.code === couponCode.toUpperCase() && c.isActive && c.usedCount < c.maxUses
            );
            if (coupon) {
                totalAmount = Math.round(event.price * (1 - coupon.discountPercent / 100));
                couponUsed = coupon.code;
                coupon.usedCount += 1;
                await event.save();
            }
        }

        // For free events, book directly
        if (totalAmount === 0) {
            const ticketId = `CP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
            const qrCode = await generateQR({
                ticketId,
                eventId: event._id,
                eventTitle: event.title,
                userName: req.user.name,
            });

            const booking = await Booking.create({
                event: eventId,
                user: req.user._id,
                ticketId,
                qrCode,
                totalAmount: 0,
                couponUsed,
                status: 'confirmed',
            });

            // Update tickets sold
            event.ticketsSold += 1;
            await event.save();

            await booking.populate('event', 'title date venue');

            // Send email notification
            sendEmail({
                to: req.user.email,
                subject: `🎫 Booking Confirmed - ${event.title}`,
                html: `
          <h2>Your ticket is confirmed!</h2>
          <p><strong>Event:</strong> ${event.title}</p>
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
          <p><strong>Venue:</strong> ${event.venue}</p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p>Show your QR code at the venue for check-in.</p>
        `,
            });

            return res.status(201).json({ success: true, data: booking });
        }

        // For paid events, return info for payment flow
        res.json({
            success: true,
            requiresPayment: true,
            totalAmount,
            couponUsed,
            eventId: event._id,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my
exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date venue image category college price')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

// @desc    Get bookings for an event (organizer)
// @route   GET /api/bookings/event/:eventId
exports.getEventBookings = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const bookings = await Booking.find({ event: req.params.eventId })
            .populate('user', 'name email college phone')
            .sort({ createdAt: -1 });

        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify/scan ticket (check-in)
// @route   POST /api/bookings/verify/:ticketId
exports.verifyTicket = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ ticketId: req.params.ticketId })
            .populate('event', 'title date venue organizer')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Invalid ticket' });
        }

        // Verify organizer owns this event
        if (
            booking.event.organizer.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ success: false, message: 'Not authorized to verify this ticket' });
        }

        if (booking.status === 'checked-in') {
            return res.status(400).json({
                success: false,
                message: 'Ticket already checked in',
                checkedInAt: booking.checkedInAt,
            });
        }

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Ticket is cancelled' });
        }

        booking.status = 'checked-in';
        booking.checkedInAt = new Date();
        await booking.save();

        res.json({
            success: true,
            message: 'Ticket verified successfully',
            data: {
                ticketId: booking.ticketId,
                attendee: booking.user.name,
                event: booking.event.title,
                checkedInAt: booking.checkedInAt,
            },
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
exports.getBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('event', 'title date venue image category college price organizer')
            .populate('user', 'name email');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check ownership
        if (
            booking.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};
