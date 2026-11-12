const User = require('../models/User');
const PartnerRequest = require('../models/PartnerRequest');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const PUBLIC_FIELDS = 'name nativeLanguages learningLanguages bio';

// LEP-8: GET /api/partners?language=Spanish
// Visible learners who speak the language, never yourself or a hidden profile.
const searchPartners = async (req, res) => {
    try {
        const filter = { _id: { $ne: req.user.id }, hidden: { $ne: true } };
        const language = (req.query.language || '').trim();
        if (language) filter.nativeLanguages = { $regex: `^${escapeRegex(language)}$`, $options: 'i' };
        const partners = await User.find(filter).select(PUBLIC_FIELDS).limit(50);
        res.json(partners);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LEP-9: POST /api/requests { to, message }
const createRequest = async (req, res) => {
    const { to, message } = req.body;
    try {
        if (String(to) === String(req.user.id)) {
            return res.status(400).json({ message: 'You cannot send a partner request to yourself' });
        }
        const target = await User.findById(to);
        if (!target || target.hidden) return res.status(404).json({ message: 'Learner not found' });

        // One open or accepted request per pair, whichever side sent it
        const existing = await PartnerRequest.findOne({
            status: { $in: ['pending', 'accepted'] },
            $or: [{ from: req.user.id, to }, { from: to, to: req.user.id }],
        });
        if (existing) return res.status(409).json({ message: `A ${existing.status} request already exists with this learner` });

        const request = await PartnerRequest.create({ from: req.user.id, to, message });
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LEP-9/LEP-10: GET /api/requests -> { incoming, outgoing }
const listRequests = async (req, res) => {
    try {
        const [incoming, outgoing] = await Promise.all([
            PartnerRequest.find({ to: req.user.id }).populate('from', PUBLIC_FIELDS).sort({ createdAt: -1 }),
            PartnerRequest.find({ from: req.user.id }).populate('to', PUBLIC_FIELDS).sort({ createdAt: -1 }),
        ]);
        res.json({ incoming, outgoing });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LEP-10: PATCH /api/requests/:id { action: accept | decline | cancel }
const TRANSITIONS = {
    accept: { by: 'to', status: 'accepted' },
    decline: { by: 'to', status: 'declined' },
    cancel: { by: 'from', status: 'cancelled' },
};

const respondRequest = async (req, res) => {
    const rule = TRANSITIONS[req.body.action];
    try {
        const request = await PartnerRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (String(request[rule.by]) !== String(req.user.id)) {
            return res.status(403).json({ message: `Only the ${rule.by === 'to' ? 'recipient' : 'sender'} can ${req.body.action} this request` });
        }
        if (request.status !== 'pending') {
            return res.status(409).json({ message: `This request is already ${request.status}` });
        }
        request.status = rule.status;
        const updated = await request.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { searchPartners, createRequest, listRequests, respondRequest, TRANSITIONS };
