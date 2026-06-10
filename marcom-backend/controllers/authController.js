const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Cari user berdasarkan email di database
        const userQuery = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        const user = userQuery.rows[0];

        // 2. Cek apakah status akun 'Aktif' (Sesuai validasi UI)
        if (user.status !== 'Aktif') {
            return res.status(403).json({ message: 'Akun Anda dinonaktifkan. Silakan hubungi Admin Sistem!' });
        }

        // 3. Validasi password menggunakan bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Email atau password salah!' });
        }

        // 4. Generate JWT Token jika login berhasil
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Token berlaku selama 24 jam
        );

        // 5. Kirim respon sukses beserta data user ke frontend
        res.status(200).json({
            message: 'Login berhasil!',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                divisi: user.divisi,
                jabatan: user.jabatan
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Terjadi kesalahan pada server.' });
    }
};

module.exports = { login };