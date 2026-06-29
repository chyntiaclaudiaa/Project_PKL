const express = require('express');
const router = express.Router();

const {
    connectGoogleCalendar,
    googleCalendarCallback
} = require('../controllers/googleCalendarController');

const { verifyToken } = require('../middleware/authMiddleware');

// GET /api/google/connect
router.get('/connect', verifyToken, connectGoogleCalendar);

// GET /api/google/callback
router.get('/callback', googleCalendarCallback);

module.exports = router;