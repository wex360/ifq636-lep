const mongoose = require('mongoose');

// LEP-11/LEP-12: booked -> cancelled.
const sessionSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'PartnerRequest', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    startsAt: { type: Date, required: true },
    durationMins: { type: Number, min: 15, max: 120, required: true },
    status: { type: String, enum: ['booked', 'cancelled'], default: 'booked' },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
