const { Pool } = require('pg');
require('dotenv').config();

// Mengambil konfigurasi dari file .env
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

// Test koneksi saat server pertama kali berjalan
pool.connect((err) => {
    if (err) {
        console.error('Koneksi Database Gagal!', err.stack);
    } else {
        console.log('Berhasil Terhubung ke PostgreSQL');
    }
});

module.exports = pool;