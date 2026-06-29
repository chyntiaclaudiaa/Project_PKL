const { google } = require('googleapis');
const db = require('../config/db');

const toBoolean = (value) => {
    return value === true || value === 'true' || value === 'on' || value === '1';
};

const buildReminderOverrides = ({
    reminder_h7,
    reminder_h3,
    reminder_h1,
    reminder_deadline_day
}) => {
    const overrides = [];

    if (toBoolean(reminder_h7)) {
        overrides.push({
            method: 'popup',
            minutes: 7 * 24 * 60
        });
    }

    if (toBoolean(reminder_h3)) {
        overrides.push({
            method: 'popup',
            minutes: 3 * 24 * 60
        });
    }

    if (toBoolean(reminder_h1)) {
        overrides.push({
            method: 'popup',
            minutes: 24 * 60
        });
    }

    if (toBoolean(reminder_deadline_day)) {
        overrides.push({
            method: 'popup',
            minutes: 0
        });
    }

    return overrides;
};

const formatDeadlineForGoogle = (deadline) => {
    if (!deadline) return null;

    if (deadline instanceof Date) {
        return deadline.toISOString();
    }

    const value = String(deadline).trim();

    if (value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value)) {
        return value;
    }

    if (value.includes('T') && value.length === 16) {
        return `${value}:00+07:00`;
    }

    if (value.includes('T') && value.length === 19) {
        return `${value}+07:00`;
    }

    if (value.includes(' ') && value.length === 16) {
        return `${value.replace(' ', 'T')}:00+07:00`;
    }

    if (value.includes(' ') && value.length === 19) {
        return `${value.replace(' ', 'T')}+07:00`;
    }

    return null;
};

const addMinutesToDateTime = (dateTime, minutes) => {
    const date = new Date(dateTime);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
};

const createGoogleCalendarEvent = async ({
    userId,
    requestId,
    requestCode,
    letterNumber,
    deadline,
    title,
    requesterDivision,
    description,
    platformTarget,
    reminder_h7,
    reminder_h3,
    reminder_h1,
    reminder_deadline_day
}) => {
    try {
        console.log('=== CREATE GOOGLE CALENDAR EVENT START ===');
        console.log('USER ID:', userId);
        console.log('REQUEST ID:', requestId);
        console.log('DEADLINE RAW:', deadline);

        const userResult = await db.query(
            `SELECT
                google_calendar_connected,
                google_access_token,
                google_refresh_token
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            console.log('GOOGLE CALENDAR SKIP: User tidak ditemukan.');
            return null;
        }

        const user = userResult.rows[0];

        console.log('CONNECTED:', user.google_calendar_connected);
        console.log('HAS ACCESS TOKEN:', Boolean(user.google_access_token));
        console.log('HAS REFRESH TOKEN:', Boolean(user.google_refresh_token));

        if (user.google_calendar_connected !== true) {
            console.log('GOOGLE CALENDAR SKIP: User belum connect Google Calendar.');
            return null;
        }

        if (!user.google_access_token && !user.google_refresh_token) {
            console.log('GOOGLE CALENDAR SKIP: Token Google kosong.');
            return null;
        }

        const startDateTime = formatDeadlineForGoogle(deadline);
        const endDateTime = addMinutesToDateTime(startDateTime, 30);

        console.log('START DATETIME:', startDateTime);
        console.log('END DATETIME:', endDateTime);

        if (!startDateTime || !endDateTime) {
            console.log('GOOGLE CALENDAR SKIP: Format deadline tidak valid.');
            return null;
        }

        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials({
            access_token: user.google_access_token,
            refresh_token: user.google_refresh_token
        });

        const calendar = google.calendar({
            version: 'v3',
            auth: oauth2Client
        });

        const reminderOverrides = buildReminderOverrides({
            reminder_h7,
            reminder_h3,
            reminder_h1,
            reminder_deadline_day
        });

        const eventResult = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: {
                summary: `Deadline Konten - ${title}`,
                description:
                    `Kode Request: ${requestCode || '-'}\n` +
                    `Nomor Surat: ${letterNumber || '-'}\n` +
                    `Divisi Pengaju: ${requesterDivision || '-'}\n` +
                    `Platform Target: ${platformTarget || '-'}\n\n` +
                    `Deskripsi:\n${description || '-'}`,
                start: {
                    dateTime: startDateTime,
                    timeZone: 'Asia/Jakarta'
                },
                end: {
                    dateTime: endDateTime,
                    timeZone: 'Asia/Jakarta'
                },
                reminders: {
                    useDefault: false,
                    overrides: reminderOverrides.length > 0
                        ? reminderOverrides
                        : [
                            {
                                method: 'popup',
                                minutes: 0
                            }
                        ]
                }
            }
        });

        console.log('GOOGLE EVENT CREATED:', eventResult.data.id);

        await db.query(
            `UPDATE content_requests
             SET google_event_id = $1
             WHERE id = $2`,
            [eventResult.data.id, requestId]
        );

        console.log('GOOGLE EVENT ID SAVED TO DATABASE.');
        console.log('=== CREATE GOOGLE CALENDAR EVENT END ===');

        return eventResult.data.id;
    } catch (err) {
    const errorData = err.response?.data || err.message;
    console.error('GOOGLE CALENDAR EVENT ERROR:', errorData);

    // Kalau token expired/revoked, reset status user di DB
    if (
        errorData?.error === 'invalid_grant' ||
        errorData?.error_description?.includes('expired') ||
        errorData?.error_description?.includes('revoked')
    ) {
        console.log('TOKEN INVALID — Resetting Google Calendar status for user:', userId);

        await db.query(
            `UPDATE users
             SET google_calendar_connected = false,
                 google_access_token = NULL,
                 google_refresh_token = NULL
             WHERE id = $1`,
            [userId]
        );

        console.log('Google Calendar status reset. User perlu reconnect.');
    }

    return null;
}
};

module.exports = {
    createGoogleCalendarEvent
};