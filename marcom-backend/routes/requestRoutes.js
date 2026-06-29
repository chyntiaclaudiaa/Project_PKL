const express = require('express');
const router = express.Router();

const {
    getPicUsers,
    createRequest,
    getMyRequests,
    getMyDashboardSummary,
    getAllRequestSummary,
    getRequestDetail,
    updateRequest,
    updateRequestStatus,
    uploadResultFile,
    addComment,
    deleteComment,
    getNotifications
} = require('../controllers/requestController');

const {
    verifyToken,
    isMarcomMember,
    allowRoles
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

// 1. Membuat request konten baru
// POST /api/requests
router.post(
    '/',
    verifyToken,
    isMarcomMember,
    createRequest
);

// 2. Mengambil ringkasan dashboard anggota
// GET /api/requests/my/summary
router.get(
    '/my/summary',
    verifyToken,
    isMarcomMember,
    getMyDashboardSummary
);

// 3. Mengambil ringkasan semua request untuk admin / atasan
// GET /api/requests/summary/all
router.get(
    '/summary/all',
    verifyToken,
    allowRoles('admin', 'marcom_supervisor', 'marcom_manager'),
    getAllRequestSummary
);

// 4. Mengambil semua request milik anggota yang sedang login
// GET /api/requests/my
router.get(
    '/my',
    verifyToken,
    isMarcomMember,
    getMyRequests
);

// 5. Mengambil daftar PIC dari database
// GET /api/requests/pic-users
router.get(
    '/pic-users',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager', 'admin'),
    getPicUsers
);

// Notifikasi anggota
router.get(
    '/notifications',
    verifyToken,
    isMarcomMember,
    getNotifications
);

// 6. Mengambil detail request
// GET /api/requests/:id
router.get(
    '/:id',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager', 'admin'),
    getRequestDetail
);

// 7. Edit request konten
// PUT /api/requests/:id
router.put(
    '/:id',
    verifyToken,
    isMarcomMember,
    updateRequest
);

// 8. Mengubah status request
// PUT /api/requests/:id/status
router.put(
    '/:id/status',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager'),
    updateRequestStatus
);

// 9. Upload hasil konten
// POST /api/requests/:id/upload-result
// upload.array('result_file', 10) -> izinkan upload sampai 10 foto/video sekaligus,
// semua dikirim dengan field name yang sama: "result_file"
router.post(
    '/:id/upload-result',
    verifyToken,
    isMarcomMember,
    upload.array('result_file', 10),
    uploadResultFile
);

// 10. Menambahkan komentar pada request
// POST /api/requests/:id/comments
router.post(
    '/:id/comments',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager'),
    addComment
);

// 11. Menghapus komentar pada request
// DELETE /api/requests/:id/comments/:commentId
router.delete(
    '/:id/comments/:commentId',
    verifyToken,
    deleteComment
);


module.exports = router;