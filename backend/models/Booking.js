const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Event',
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ticketId: {
            type: String,
            required: true,
            unique: true,
        },
        qrCode: {
            type: String, // base64 data URL
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['confirmed', 'cancelled', 'checked-in'],
            default: 'confirmed',
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
        },
        couponUsed: {
            type: String,
            default: '',
        },
        checkedInAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// Prevent duplicate bookings
bookingSchema.index({ event: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Booking', bookingSchema);
