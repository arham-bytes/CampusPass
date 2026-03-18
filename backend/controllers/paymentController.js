const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const generateQR = require('../utils/generateQR');
const sendEmail = require('../utils/sendEmail');

const getRazorpay = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
exports.createOrder = async (req, res, next) => {
    try {
        const { eventId, couponCode } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event.status !== 'approved') {
            return res.status(400).json({ success: false, message: 'Event not approved' });
        }

        if (event.ticketsSold >= event.totalTickets) {
            return res.status(400).json({ success: false, message: 'Sold out' });
        }

        // Check duplicate booking
        const existingBooking = await Booking.findOne({ event: eventId, user: req.user._id });
        if (existingBooking) {
            return res.status(400).json({ success: false, message: 'Already booked' });
        }

        // Calculate price with coupon
        let amount = event.price;
        let couponUsed = '';

        if (couponCode) {
            const coupon = event.coupons.find(
                (c) => c.code === couponCode.toUpperCase() && c.isActive && c.usedCount < c.maxUses
            );
            if (coupon) {
                amount = Math.round(event.price * (1 - coupon.discountPercent / 100));
                couponUsed = coupon.code;
            }
        }

        if (amount === 0) {
            return res.status(400).json({
                success: false,
                message: 'Free event — use booking endpoint directly',
            });
        }

        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: amount * 100, // Razorpay uses paisa
            currency: 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                eventId: event._id.toString(),
                userId: req.user._id.toString(),
                couponUsed,
            },
        });

        // Save payment record
        const payment = await Payment.create({
            user: req.user._id,
            event: eventId,
            razorpayOrderId: order.id,
            amount,
            status: 'created',
        });

        res.json({
            success: true,
            order: {
                id: order.id,
                amount: order.amount,
                currency: order.currency,
            },
            paymentId: payment._id,
            key: process.env.RAZORPAY_KEY_ID,
            couponUsed,
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Verify payment and create booking
// @route   POST /api/payments/verify
exports.verifyPayment = async (req, res, next) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, couponCode } =
            req.body;

        // Verify signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            // Update payment status to failed
            await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                { status: 'failed' }
            );
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        // Payment verified — create booking
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        const ticketId = `CP-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
        const qrCode = await generateQR({
            ticketId,
            eventId: event._id,
            eventTitle: event.title,
            userName: req.user.name,
        });

        // Apply coupon
        let totalAmount = event.price;
        let couponUsed = '';
        if (couponCode) {
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

        // Update payment
        const payment = await Payment.findOneAndUpdate(
            { razorpayOrderId: razorpay_order_id },
            {
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature,
                status: 'paid',
            },
            { new: true }
        );

        // Create booking
        const booking = await Booking.create({
            event: eventId,
            user: req.user._id,
            ticketId,
            qrCode,
            totalAmount,
            couponUsed,
            payment: payment._id,
            status: 'confirmed',
        });

        // Update tickets sold
        event.ticketsSold += 1;
        await event.save();

        // Update payment with booking ref
        payment.booking = booking._id;
        await payment.save();

        await booking.populate('event', 'title date venue');

        // Send confirmation email
        sendEmail({
            to: req.user.email,
            subject: `🎫 Booking Confirmed - ${event.title}`,
            html: `
        <h2>Payment Successful! Your ticket is confirmed.</h2>
        <p><strong>Event:</strong> ${event.title}</p>
        <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
        <p><strong>Venue:</strong> ${event.venue}</p>
        <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
        <p><strong>Ticket ID:</strong> ${ticketId}</p>
        <p>Show your QR code at the venue for check-in.</p>
      `,
        });

        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};
