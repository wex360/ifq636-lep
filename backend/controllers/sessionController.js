const PartnerRequest = require('../models/PartnerRequest');
const Session = require('../models/Session');

const isParticipant = (ids, userId) => ids.some((p) => String(p._id || p) === String(userId));

// LEP-11: POST /api/sessions { requestId, startsAt, durationMins }
// Only the two learners on an accepted request can book.
const bookSession = async (req, res) => {
    const { requestId, startsAt, durationMins } = req.body;
    try {
        const request = await PartnerRequest.findById(requestId);
        if (!request || !isParticipant([request.from, request.to], req.user.id)) {
            return res.status(404).json({ message: 'Partner not found' });
        }
        if (request.status !== 'accepted') {
            return res.status(409).json({ message: 'You can only book with an accepted partner' });
        }
        const session = await Session.create({
            request: request._id,
            participants: [request.from, request.to],
            startsAt: new Date(startsAt),
            durationMins: Number(durationMins),
        });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// GET /api/sessions -> my sessions, soonest first
const listSessions = async (req, res) => {
    try {
        const sessions = await Session.find({ participants: req.user.id })
            .populate('participants', 'name')
            .sort({ startsAt: 1 });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LEP-12: PATCH /api/sessions/:id/cancel -> either participant, before it starts
const cancelSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id);
        if (!session || !isParticipant(session.participants, req.user.id)) {
            return res.status(404).json({ message: 'Session not found' });
        }
        if (session.status !== 'booked') return res.status(409).json({ message: 'This session is already cancelled' });
        if (session.startsAt <= new Date()) return res.status(409).json({ message: 'A session that has started cannot be cancelled' });
        session.status = 'cancelled';
        session.cancelledBy = req.user.id;
        const updated = await session.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { bookSession, listSessions, cancelSession };
