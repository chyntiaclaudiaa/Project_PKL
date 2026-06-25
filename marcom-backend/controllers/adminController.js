const db = require('../config/db');
const bcrypt = require('bcrypt');

// 1. Mengambil semua data pengguna + Fitur Pencarian (Search)
const getAllUsers = async (req, res) => {
    const { search } = req.query;

    try {
        let query = 'SELECT id, name, email, role, divisi, jabatan, status, created_at FROM users';
        let params = [];

        // Jika ada query pencarian (?search=...) dari frontend
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

        let finalRole = role;
        const teksPengecekan = `${jabatan || ''} ${divisi || ''}`.toLowerCase();

        if (teksPengecekan.includes('pimpinan') || teksPengecekan.includes('pemimpin') || teksPengecekan.includes('manager')) {
            finalRole = 'marcom_manager'; 
        } else {
            if (role !== 'admin' && role !== 'marcom_manager') {
                finalRole = 'marcom_member';
            }
        }

        // Hash password sementara sebelum disimpan ke database
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Simpan ke database (Ganti parameter $4 menjadi finalRole)
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

// 3. Memperbarui data pengguna (Form Edit Pengguna)
// 3. Memperbarui data pengguna (Form Edit Pengguna)
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, divisi, jabatan, status, password } = req.body; 

    try {
        // 💡 TAHAP KUNCI: Otomatisasi penentuan role saat proses EDIT berdasarkan jabatan baru
        let finalRole = role;
        if (jabatan && (jabatan.toLowerCase().includes('pimpinan') || jabatan.toLowerCase().includes('pemimpin') || jabatan.toLowerCase().includes('manager'))) {
            finalRole = 'marcom_manager'; // Otomatis ubah ke atasan/pimpinan di database
        } else if (role !== 'admin') {
            finalRole = 'marcom_member';  // Otomatis ubah ke anggota/staff di database
        }

        // SKENARIO A: Jika form mengirimkan password baru
        if (password && password.trim() !== '') {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Ganti parameter $3 menggunakan finalRole
            const updatedUser = await db.query(
                `UPDATE users 
                 SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6, password = $7 
                 WHERE id = $8 
                 RETURNING id, name, email, role, divisi, jabatan, status`,
                [name, email, finalRole, divisi, jabatan, status, hashedPassword, id]
            );

            if (updatedUser.rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
            return res.status(200).json({ message: 'Data dan Password pengguna berhasil diperbarui!', user: updatedUser.rows[0] });
        } 
        
        // SKENARIO B: Jika password kosong (hanya update data profil)
        // Ganti parameter $3 menggunakan finalRole
        const updatedUser = await db.query(
            `UPDATE users 
             SET name = $1, email = $2, role = $3, divisi = $4, jabatan = $5, status = $6 
             WHERE id = $7 
             RETURNING id, name, email, role, divisi, jabatan, status`,
            [name, email, finalRole, divisi, jabatan, status, id]
        );

        if (updatedUser.rows.length === 0) return res.status(404).json({ message: 'Pengguna tidak ditemukan!' });
        res.status(200).json({ message: 'Data pengguna berhasil diperbarui!', user: updatedUser.rows[0] });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui data pengguna.' });
    }
};

// 4. BARU: Memperbarui password admin dengan mencocokkan password lama di database
const updatePassword = async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    try {
        // Ambil data user dari database berdasarkan ID
        const userResult = await db.query('SELECT password FROM users WHERE id = $1', [id]);
        
        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'Pengguna tidak ditemukan.' });
        }

        const user = userResult.rows[0];

        // Verifikasi apakah password lama yang diketik COCOK dengan hash di database
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Password saat ini salah!' });
        }

        // Jika cocok, hash password baru sebelum dimasukkan ke database
        const saltRounds = 10;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update record password baru ke PostgreSQL
        await db.query('UPDATE users SET password = $2 WHERE id = $1', [id, hashedNewPassword]);

        res.status(200).json({ message: 'Password admin berhasil diperbarui!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Gagal memperbarui password pada server.' });
    }
};

// Daftarkan updatePassword di module exports paling bawah
module.exports = { getAllUsers, createUser, updateUser, updatePassword };