const express = require('express');
const { register, login, getMe, updateProfile } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { userValidation, validate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', userValidation.register, validate, register);
router.post('/login', userValidation.login, validate, login);

// Protected routes
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfile);

module.exports = router;