const db = require('../config/db');
const bcrypt = require('bcrypt');
const { shareMarcomFolderToUser, revokeMarcomFolderFromUser } = require('../services/googleDriveService');

// 1. Mengambil semua data pengguna + Fitur Pencarian (Search)
const getAllUsers = async (req, res) => {
    const { search } = req.query;

    try {
        let query = 'SELECT id, name, email, role, divisi, jabatan, status, created_at FROM users';
        let params = [];

        if (search) {
            query += ' WHERE name ILIKE $1 OR email ILIKE $1 OR divisi ILIKE $1 OR jabatan ILIKE $1';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY created_at DESC';
        
        const result = await db.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal mengambil data pengguna.' });
    }
};

// 2. Menambah pengguna baru (Form Tambah Pengguna)
const createUser = async (req, res) => {
    const { name, email, password, role, divisi, jabatan, status } = req.body;

    try {
        // Validasi apakah email sudah terdaftar
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar di sistem!' });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Simpan ke database
        const newUser = await db.query(
            `INSERT INTO users (name, email, password, role, divisi, jabatan, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [name, email, hashedPassword, role, divisi, jabatan, status || 'Aktif']
        );

        const createdUser = newUser.rows[0];

        // Kalau user baru ini punya role marcom + status Aktif, 
        // share folder "Marcomm Content" ke emailnya
        const userRole = role || 'guest';
        const userStatus = status || 'Aktif';
        const isMarcomRole = userRole && userRole.includes('marcom');

        if (userStatus === 'Aktif' && isMarcomRole) {
            const shareSuccess = await shareMarcomFolderToUser(email);
            if (shareSuccess) {
                console.log(`✓ NEW USER: ${email} - Marcomm Content folder shared automatically`);
            } else {
                console.log(`⚠ NEW USER: ${email} - Folder share gagal, silakan share manual`);
            }
        }

        res.status(201).json({
            message: 'Pengguna baru berhasil ditambahkan!',
            user: createdUser
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal menambahkan pengguna baru.' });
    }
};

// 3. Memperbarui data pengguna (Form Edit Pengguna)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, divisi, jabatan, status } = req.body;

    try {
        // Cek user yang lama dulu
        const oldUserResult = await db.query(
            'SELECT email, role, status FROM users WHERE id = $1',
            [id]
        );

        if (oldUserResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }

        const oldUser = oldUserResult.rows[0];

        // Update user
        const updatedUser = await db.query(
            `UPDATE users 
             SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6 
             WHERE id = $7 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [name, email, role, divisi, jabatan, status, id]
        );

        const updatedUserData = updatedUser.rows[0];
        const newEmail = email || oldUser.email;
        const newRole = role || oldUser.role;
        const newStatus = status || oldUser.status;
        const isMarcomRole = newRole && newRole.includes('marcom');

        // Auto-manage folder sharing based on new status & role
        if (newStatus === 'Aktif' && isMarcomRole) {
            // User AKTIF + punya role MARCOM → SHARE folder
            if (!oldUser.email.includes('marcom') || oldUser.status !== 'Aktif') {
                // Hanya share kalau sebelumnya belum punya akses
                const shareSuccess = await shareMarcomFolderToUser(newEmail);
                if (shareSuccess) {
                    console.log(`✓ UPDATE USER: ${newEmail} - Marcomm Content folder shared (activated + marcom role)`);
                }
            }
        } else if (newStatus === 'Nonaktif') {
            // User jadi NONAKTIF → REVOKE folder
            const revokeSuccess = await revokeMarcomFolderFromUser(newEmail);
            if (revokeSuccess) {
                console.log(`✓ UPDATE USER: ${newEmail} - Marcomm Content folder access revoked (deactivated)`);
            }
        } else if (newStatus === 'Aktif' && !isMarcomRole) {
            // User AKTIF tapi BUKAN role marcom → REVOKE folder
            const revokeSuccess = await revokeMarcomFolderFromUser(newEmail);
            if (revokeSuccess) {
                console.log(`✓ UPDATE USER: ${newEmail} - Marcomm Content folder access revoked (no marcom role)`);
            }
        }

        res.status(200).json({
            message: 'Data pengguna berhasil diperbarui!',
            user: updatedUserData
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui data pengguna.' });
    }
};

// 4. Memperbarui password
const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        const userResult = await db.query('SELECT password FROM users WHERE id = $1', [id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password saat ini salah!' });
        }

        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        await db.query('UPDATE users SET password = $2 WHERE id = $1', [id, hashedNewPassword]);

        res.status(200).json({ message: 'Password admin berhasil diperbarui!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui password pada server.' });
    }
};

module.exports = { getAllUsers, createUser, updateUser, updatePassword };