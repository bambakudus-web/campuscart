const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, getProfile);
router.put('/me', requireAuth, updateProfile);
router.put('/me/password', requireAuth, changePassword);

module.exports = router;
