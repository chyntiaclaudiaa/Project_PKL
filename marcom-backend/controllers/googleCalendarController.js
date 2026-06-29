const { google } = require('googleapis');
const db = require('../config/db');

const SCOPES = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/drive.file'
];

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// GET /api/google/connect
const connectGoogleCalendar = async (req, res) => {
    try {
        const userId = req.user.id;

        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: SCOPES,
            state: userId
        });

        res.status(200).json({
            url: authUrl
        });
    } catch (err) {
        console.error('GOOGLE CONNECT ERROR:', err.message);
        res.status(500).json({
            message: 'Gagal membuat URL koneksi Google Calendar.'
        });
    }
};

// GET /api/google/callback
const googleCalendarCallback = async (req, res) => {
    const { code, state } = req.query;
    const userId = state;

    try {
        if (!code || !userId) {
            return res.redirect(`${process.env.FRONTEND_URL}/anggota/input-request?calendar=failed`);
        }

        const { tokens } = await oauth2Client.getToken(code);

        await db.query(
            `UPDATE users
             SET google_calendar_connected = true,
                 google_access_token = $1,
                 google_refresh_token = COALESCE($2, google_refresh_token),
                 google_token_expiry = to_timestamp($3 / 1000.0)
             WHERE id = $4`,
            [
                tokens.access_token || null,
                tokens.refresh_token || null,
                tokens.expiry_date || Date.now(),
                userId
            ]
        );

        res.redirect(`${process.env.FRONTEND_URL}/anggota/input-request?calendar=success`);
    } catch (err) {
        console.error('GOOGLE CALLBACK ERROR:', err.message);
        res.redirect(`${process.env.FRONTEND_URL}/anggota/input-request?calendar=failed`);
    }
};

module.exports = {
    connectGoogleCalendar,
    googleCalendarCallback
};