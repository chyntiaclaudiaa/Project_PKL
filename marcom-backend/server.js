const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();


const app = express();


app.use(cors()); 

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const requestRoutes = require('./routes/requestRoutes');
const profileRoutes = require('./routes/profileRoutes');
const googleCalendarRoutes = require('./routes/googleCalendarRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/google', googleCalendarRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Server MarCom (Content Marcom Engagement & Tracking System) API Berjalan Lancar!',
        status: 'Active',
        year: 2026
    });
});

app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);
    console.error('Request Body:', req.body);
    console.error('Request Method:', req.method);
    console.error('Request URL:', req.url);
    
    res.status(err.status || 500).json({
        message: err.message || 'Terjadi kesalahan pada server.',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;

// Menjalankan server Express
app.listen(PORT, () => {
    console.log(`=============================================`);
    console.log(` Server berjalan di http://localhost:${PORT}`);
    console.log(`=============================================`);
});

module.exports = app;