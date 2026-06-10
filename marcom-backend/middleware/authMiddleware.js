const jwt = require('jsonwebtoken');

// 1. Validasi apakah user sudah login & membawa token JWT valid
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Mengambil string token setelah 'Bearer'

    if (!token) {
        return res.status(401).json({ message: 'Akses ditolak, token tidak ditemukan!' });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Menyimpan data user (id, role) ke dalam request
        next();
    } catch (err) {
        res.status(403).json({ message: 'Token tidak valid atau telah kedaluwarsa!' });
    }
};

// 2. Validasi apakah user memiliki role 'admin'
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses khusus Admin! Anda tidak memiliki otoritas.' });
    }
    next();
};

module.exports = { verifyToken, isAdmin };