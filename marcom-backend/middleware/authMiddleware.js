const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

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

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Akses khusus Admin! Anda tidak memiliki otoritas.' });
    }
    next();
};

const isMarcomMember = (req, res, next) => {
    if (req.user.role !== 'marcom_member') {
        return res.status(403).json({
            message: 'Akses khusus Anggota MarCom!'
        });
    }
    next();
};

const isMarcomManager = (req, res, next) => {
    if (req.user.role !== 'marcom_manager') {
        return res.status(403).json({
            message: 'Akses khusus Atasan MarCom!'
        });
    }

    next();
};

const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Anda tidak memiliki akses ke fitur ini.'
            });
        }

        next();
    };
};

module.exports = {
    verifyToken,
    isAdmin,
    isMarcomMember,
    isMarcomManager,
    allowRoles
};