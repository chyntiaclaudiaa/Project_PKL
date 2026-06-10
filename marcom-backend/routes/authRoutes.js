const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// Jalur endpoint: POST /api/auth/login
router.post('/login', login);

module.exports = router;