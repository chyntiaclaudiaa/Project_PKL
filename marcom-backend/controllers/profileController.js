const db = require('../config/db');
const bcrypt = require('bcrypt');

// 1. Ambil profil user yang sedang login
const getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT id, name, email, role, divisi, jabatan, status
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'Profil pengguna tidak ditemukan.'
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal mengambil profil pengguna.'
        });
    }
};

// 2. Ganti password sendiri
const updateMyPassword = async (req, res) => {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    try {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: 'Semua field password wajib diisi.'
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: 'Password baru minimal 8 karakter.'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: 'Konfirmasi password baru tidak sama.'
            });
        }

        const userResult = await db.query(
            `SELECT password FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan.'
            });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Password lama salah.'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query(
            `UPDATE users
             SET password = $1,
                 must_change_password = false
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        res.status(200).json({
            message: 'Password berhasil diperbarui.'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal memperbarui password.'
        });
    }
};

// 3. Ganti email sendiri
const updateMyEmail = async (req, res) => {
    const userId = req.user.id;
    const { newEmail, password } = req.body;

    try {
        if (!newEmail || !password) {
            return res.status(400).json({
                message: 'Email baru dan password wajib diisi.'
            });
        }

        const userResult = await db.query(
            `SELECT id, password FROM users WHERE id = $1`,
            [userId]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                message: 'Pengguna tidak ditemukan.'
            });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: 'Password konfirmasi salah.'
            });
        }

        const emailCheck = await db.query(
            `SELECT id FROM users
             WHERE LOWER(email) = LOWER($1)
             AND id <> $2`,
            [newEmail, userId]
        );

        if (emailCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'Email baru sudah digunakan oleh pengguna lain.'
            });
        }

        const updatedUser = await db.query(
            `UPDATE users
             SET email = $1
             WHERE id = $2
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [newEmail, userId]
        );

        res.status(200).json({
            message: 'Email berhasil diperbarui.',
            user: updatedUser.rows[0]
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal memperbarui email.'
        });
    }
};

const getCalendarStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT google_calendar_connected
             FROM users
             WHERE id = $1`,
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'User tidak ditemukan.'
            });
        }

        res.status(200).json({
            connected: result.rows[0].google_calendar_connected === true
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({
            message: 'Gagal mengecek status Google Calendar.'
        });
    }
};

module.exports = {
    getProfile,
    updateMyPassword,
    updateMyEmail,
    getCalendarStatus
};