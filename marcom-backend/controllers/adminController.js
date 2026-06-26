const db = require('../config/db');
const bcrypt = require('bcrypt');

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
        const teksPengecekan = `${jabatan || ''} ${divisi || ''}`.toLowerCase();

        if (teksPengecekan.includes('pimpinan') || teksPengecekan.includes('pemimpin') || teksPengecekan.includes('manager')) {
            finalRole = 'marcom_manager'; 
        } else {
            if (role !== 'admin' && role !== 'marcom_manager') {
                finalRole = 'marcom_member';
            }
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await db.query(
            `INSERT INTO users (name, email, password, role, divisi, jabatan, status) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [name, email, hashedPassword, finalRole, divisi, jabatan, (status === null || status === undefined) ? 'Aktif' : status]
        );

        res.status(201).json({
            message: 'Pengguna baru berhasil ditambahkan!',
            user: newUser.rows[0]
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
        const finalStatus = status !== undefined ? status : existingUser.status; // Mencegah status berubah nonaktif/NULL
        let inputRole = role !== undefined ? role : existingUser.role;

        let finalRole = inputRole;
        if (finalJabatan && (finalJabatan.toLowerCase().includes('pimpinan') || finalJabatan.toLowerCase().includes('pemimpin') || finalJabatan.toLowerCase().includes('manager'))) {
            finalRole = 'marcom_manager'; 
        } else if (inputRole !== 'admin') {
            finalRole = 'marcom_member';  
        }

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
        
        const updatedUser = await db.query(
            `UPDATE users 
             SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6 
             WHERE id = $7 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [finalName, finalEmail, finalRole, finalDivisi, finalJabatan, finalStatus, id]
        );

        res.status(200).json({ message: 'Data pengguna berhasil diperbarui!', user: updatedUser.rows[0] });

    } catch (err) {
        console.error(err.message);
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