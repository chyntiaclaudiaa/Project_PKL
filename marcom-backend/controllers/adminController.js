const db = require('../config/db');
const bcrypt = require('bcrypt');
const { shareMarcomFolderToUser, revokeMarcomFolderFromUser } = require('../services/googleDriveService');

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

const createUser = async (req, res) => {
    const { name, email, password, role, divisi, jabatan, status } = req.body;

    try {
        const emailCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar di sistem!' });
        }

        let finalRole = role;
        const cekJabatan = (jabatan || '').toLowerCase();

        if (cekJabatan === 'admin') {
            finalRole = 'admin';
        } else if (cekJabatan === 'pemimpin divisi') {
            finalRole = 'marcom_manager';
        } else if (cekJabatan === 'anggota') {
            finalRole = 'marcom_member';
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await db.query(
            `INSERT INTO users (name, email, password, role, divisi, jabatan, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [name, email, hashedPassword, finalRole, divisi, jabatan, (status === null || status === undefined) ? 'Aktif' : status]
        );

        const createdUser = newUser.rows[0];

        // share folder "Marcomm Content" ke emailnya
        const userRole = finalRole || 'guest';
        const userStatus = status || 'Aktif';
        const isMarcomRole = userRole && userRole.includes('marcom');

        if (userStatus === 'Aktif' && isMarcomRole) {
            const shareSuccess = await shareMarcomFolderToUser(email);
            if (shareSuccess) {
                console.log(`NEW USER: ${email} - Marcomm Content folder shared automatically`);
            } else {
                console.log(`NEW USER: ${email} - Folder share gagal, silakan share manual`);
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

const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, divisi, jabatan, status, password } = req.body; 

    try {
        const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        }
        
        const existingUser = userCheck.rows[0];

        const finalName = name || existingUser.name;
        const finalEmail = email || existingUser.email;
        const finalDivisi = divisi !== undefined ? divisi : existingUser.divisi;
        const finalJabatan = jabatan !== undefined ? jabatan : existingUser.jabatan;
        const finalStatus = status !== undefined ? status : existingUser.status; 
        
        let finalRole = role !== undefined ? role : existingUser.role; 
        const cekJabatan = (finalJabatan || '').toLowerCase();
        
        if (cekJabatan === 'admin') {
            finalRole = 'admin';
        } else if (cekJabatan === 'pemimpin divisi') {
            finalRole = 'marcom_manager';
        } else if (cekJabatan === 'anggota') {
            finalRole = 'marcom_member';
        }

        // Proses jika password diubah
        if (password && password.trim() !== '') {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            const updatedUser = await db.query(
                `UPDATE users 
                 SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6, password = $7 
                 WHERE id = $8 
                 RETURNING id, name, email, role, divisi, jabatan, status`,
                [finalName, finalEmail, finalRole, finalDivisi, finalJabatan, finalStatus, hashedPassword, id]
            );

            return res.status(200).json({ message: 'Data dan Password pengguna berhasil diperbarui!', user: updatedUser.rows[0] });
        } 
        
        // Proses jika password tidak diubah
        const updatedUser = await db.query(
            `UPDATE users 
             SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6 
             WHERE id = $7 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [finalName, finalEmail, finalRole, finalDivisi, finalJabatan, finalStatus, id]
        );

        const updatedUserData = updatedUser.rows[0];
        const isMarcomRole = finalRole && finalRole.includes('marcom');

        // Logika Google Drive Menggunakan existingUser (bukan oldUser)
        if (finalStatus === 'Aktif' && isMarcomRole) {
            if (!existingUser.email.includes('marcom') || existingUser.status !== 'Aktif') {
                const shareSuccess = await shareMarcomFolderToUser(finalEmail);
                if (shareSuccess) {
                    console.log(`UPDATE USER: ${finalEmail} - Marcomm Content folder shared (activated + marcom role)`);
                }
            }
        } else if (finalStatus === 'Nonaktif') {
            const revokeSuccess = await revokeMarcomFolderFromUser(finalEmail);
            if (revokeSuccess) {
                console.log(`UPDATE USER: ${finalEmail} - Marcomm Content folder access revoked (deactivated)`);
            }
        } else if (finalStatus === 'Aktif' && !isMarcomRole) {
            const revokeSuccess = await revokeMarcomFolderFromUser(finalEmail);
            if (revokeSuccess) {
                console.log(`UPDATE USER: ${finalEmail} - Marcomm Content folder access revoked (no marcom role)`);
            }
        }

        res.status(200).json({
            message: 'Data pengguna berhasil diperbarui!',
            user: updatedUserData
        });
    } catch (err) {
        console.error("ERROR SAAT UPDATE USER:", err.message);
        res.status(500).json({ message: 'Gagal memperbarui data pengguna.' });
    }
};

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