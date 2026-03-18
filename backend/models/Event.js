const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, uppercase: true },
    discountPercent: { type: Number, required: true, min: 1, max: 100 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
});

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Event title is required'],
            trim: true,
            maxlength: 120,
        },
        description: {
            type: String,
            required: [true, 'Event description is required'],
            maxlength: 5000,
        },
        category: {
            type: String,
            required: true,
            enum: ['Tech', 'Fest', 'Music', 'Sports', 'Workshop', 'Seminar', 'Other'],
        },
        college: {
            type: String,
            required: [true, 'College name is required'],
            trim: true,
        },
        venue: {
            type: String,
            required: [true, 'Venue is required'],
            trim: true,
        },
        date: {
            type: Date,
            required: [true, 'Event date is required'],
        },
        endDate: {
            type: Date,
        },
        time: {
            type: String,
            default: '',
        },
        price: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
        totalTickets: {
            type: Number,
            required: true,
            min: 1,
        },
        ticketsSold: {
            type: Number,
            default: 0,
        },
        image: {
            type: String,
            default: '',
        },
        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        featured: {
            type: Boolean,
            default: false,
        },
        coupons: [couponSchema],
        tags: [String],
    },
    { timestamps: true }
);

// Virtual for available tickets
eventSchema.virtual('availableTickets').get(function () {
    return this.totalTickets - this.ticketsSold;
});

// Index for search
eventSchema.index({ title: 'text', description: 'text', college: 'text' });
eventSchema.index({ category: 1, date: 1, status: 1 });

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
