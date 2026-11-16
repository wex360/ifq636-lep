
const express = require('express');
const { registerUser, loginUser, updateUserProfile, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, required, optional, isEmail, minLength, maxLength, languageList } = require('../middleware/validate');
const router = express.Router();

router.post('/register', validate({
    name: [required('Name'), maxLength(60, 'Name')],
    email: [required('Email'), isEmail],
    password: [required('Password'), minLength(8, 'Password')],
}), registerUser);
router.post('/login', validate({
    email: [required('Email'), isEmail],
    password: [required('Password')],
}), loginUser);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validate({
    email: [optional(isEmail)],
    nativeLanguages: [optional(languageList('Native languages'))],
    learningLanguages: [optional(languageList('Learning languages'))],
    bio: [optional(maxLength(280, 'Bio'))],
}), updateUserProfile);

module.exports = router;
