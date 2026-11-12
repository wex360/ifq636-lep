const express = require('express');
const { bookSession, listSessions, cancelSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');
const { validate, required, isObjectId, futureDate, intRange } = require('../middleware/validate');
const router = express.Router();

router.route('/')
    .get(protect, listSessions)
    .post(protect, validate({
        requestId: [required('Partner'), isObjectId('Partner')],
        startsAt: [required('Start time'), futureDate('Start time')],
        durationMins: [required('Duration'), intRange(15, 120, 'Duration')],
    }), bookSession);
router.patch('/:id/cancel', protect, cancelSession);

module.exports = router;
