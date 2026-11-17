const User = require('../models/User');

// LEP-13: GET /api/moderation/users -> every learner, hidden ones included
const listUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user.id } })
            .select('name email role hidden nativeLanguages bio').sort({ name: 1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// LEP-13: PATCH /api/moderation/users/:id { hidden: true|false }
// A hidden profile drops out of partner search and cannot receive new requests.
const setHidden = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.role === 'moderator') return res.status(409).json({ message: 'A moderator profile cannot be hidden' });
        user.hidden = req.body.hidden;
        const updated = await user.save();
        res.json({ _id: updated._id, name: updated.name, hidden: updated.hidden });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { listUsers, setHidden };
