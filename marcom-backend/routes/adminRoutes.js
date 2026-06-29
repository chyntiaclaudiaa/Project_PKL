const express = require('express');
const router = express.Router();
const { getAllUsers, createUser, updateUser, updatePassword } = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.get('/users', verifyToken, isAdmin, getAllUsers);
router.post('/users', verifyToken, isAdmin, createUser);
router.put('/users/:id', verifyToken, isAdmin, updateUser);

router.put('/users/:id/password', verifyToken, isAdmin, updatePassword);

module.exports = router;