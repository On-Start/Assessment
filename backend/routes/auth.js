const express = require('express');
const router = express.Router();
const { registerUser, loginUser, verifyEmail } = require('../controllers/auth');
const validateRegistration = require('../middlewares/validationMiddleware');

router.post('/register', validateRegistration, registerUser);
router.get('/verify-email', verifyEmail);
router.post('/login', loginUser);

module.exports = router;
