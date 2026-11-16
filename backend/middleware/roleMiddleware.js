// LEP-7: second link in the middleware chain, after protect.
// Usage: router.patch('/x', protect, requireRole('moderator'), handler)
const requireRole = (...roles) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: `Requires role: ${roles.join(' or ')}` });
    }
    next();
};

module.exports = { requireRole };
