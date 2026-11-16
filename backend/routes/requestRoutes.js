const express = require('express');
const { searchPartners, createRequest, listRequests, respondRequest } = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');
const { validate, required, optional, isObjectId, maxLength, oneOf } = require('../middleware/validate');

const partners = express.Router();
partners.get('/', protect, searchPartners);

const requests = express.Router();
requests.route('/')
    .get(protect, listRequests)
    .post(protect, validate({
        to: [required('Partner'), isObjectId('Partner')],
        message: [optional(maxLength(200, 'Message'))],
    }), createRequest);
requests.patch('/:id', protect, validate({
    action: [required('Action'), oneOf(['accept', 'decline', 'cancel'], 'Action')],
}), respondRequest);

module.exports = { partners, requests };
