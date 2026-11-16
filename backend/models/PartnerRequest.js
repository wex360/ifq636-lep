const mongoose = require('mongoose');

// LEP-9/LEP-10 state machine: pending -> accepted | declined (recipient) | cancelled (sender).
// Every non-pending state is final.
const STATUSES = ['pending', 'accepted', 'declined', 'cancelled'];

const partnerRequestSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, maxlength: 200 },
    status: { type: String, enum: STATUSES, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('PartnerRequest', partnerRequestSchema);
module.exports.STATUSES = STATUSES;
