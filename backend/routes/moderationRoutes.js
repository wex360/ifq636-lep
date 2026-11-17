const express = require('express');
const { listUsers, setHidden } = require('../controllers/moderationController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate, required, oneOf } = require('../middleware/validate');
const router = express.Router();

// The full middleware chain: protect -> requireRole -> validate -> controller
router.use(protect, requireRole('moderator'));
router.get('/users', listUsers);
router.patch('/users/:id', validate({ hidden: [required('Hidden'), oneOf([true, false], 'Hidden')] }), setHidden);

module.exports = router;
