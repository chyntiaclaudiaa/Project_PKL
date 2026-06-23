const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inisialisasi aplikasi Express
const app = express();

// Middleware
app.use(cors()); // Mengizinkan akses API dari frontend (React.js) nantinya
app.use(express.json()); // Mengizinkan server menerima data berformat JSON dari request body

// Menguji dan memanggil koneksi database PostgreSQL
const pool = require('./config/db');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const dashboardRoutes = require("./routes/atasan_dashboardRoutes");
const requestRoutes = require("./routes/atasan_requestRoutes");
const commentRoutes = require("./routes/atasan_commentRoutes");
const reportRoutes = require("./routes/atasan_reportRoutes");
const atasanProfileRoutes = require(  "./routes/atasan_profileRoutes" );

// Daftarkan API Routes ke Express Middleware
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/comments", commentRoutes);
app.use( "/api/report", reportRoutes);
app.use( "/api/profile", atasanProfileRoutes);
// Route testing dasar untuk memastikan API backend aktif
app.get('/', (req, res) => {
    res.json({
        message: 'Server MarCom (Content Marcom Engagement & Tracking System) API Berjalan Lancar!',
        status: 'Active',
        year: 2026
    });
});

// Menentukan Port Server berdasarkan file .env atau default ke 5000
const PORT = process.env.PORT || 5000;

// Menjalankan server Express
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(` Server berjalan di http://localhost:${PORT}`);
    console.log(`=============================================`);
});