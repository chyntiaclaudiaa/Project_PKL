const express = require('express');
const router = express.Router();

const {
    getProfile,
    updateMyPassword,
    updateMyEmail,
    getCalendarStatus
} = require('../controllers/profileController');

const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/profile
router.get('/', verifyToken, getProfile);

// PUT /api/profile/password
router.put('/password', verifyToken, updateMyPassword);

// PUT /api/profile/email
router.put('/email', verifyToken, updateMyEmail);

// GET /api/profile/calendar-status
router.get('/calendar-status', verifyToken, getCalendarStatus);

module.exports = router;