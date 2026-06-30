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
    getNotifications,
    markNotificationRead
} = require('../controllers/requestController');

const {
    verifyToken,
    isMarcomMember,
    allowRoles
} = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.post(
    '/',
    verifyToken,
    isMarcomMember,
    createRequest
);

router.get(
    '/my/summary',
    verifyToken,
    isMarcomMember,
    getMyDashboardSummary
);

router.get(
    '/summary/all',
    verifyToken,
    allowRoles('admin', 'marcom_supervisor', 'marcom_manager'),
    getAllRequestSummary
);

router.get(
    '/my',
    verifyToken,
    isMarcomMember,
    getMyRequests
);

router.get(
    '/pic-users',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager', 'admin'),
    getPicUsers
);

router.get(
    '/notifications',
    verifyToken,
    isMarcomMember,
    getNotifications
);

router.put(
    '/notifications/:commentId/read',
    verifyToken,
    isMarcomMember,
    markNotificationRead
);

router.get(
    '/:id',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager', 'admin'),
    getRequestDetail
);

router.put(
    '/:id',
    verifyToken,
    isMarcomMember,
    updateRequest
);

router.put(
    '/:id/status',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager'),
    updateRequestStatus
);

router.post(
    '/:id/upload-result',
    verifyToken,
    isMarcomMember,
    upload.array('result_file', 10),
    uploadResultFile
);

router.post(
    '/:id/comments',
    verifyToken,
    allowRoles('marcom_member', 'marcom_supervisor', 'marcom_manager'),
    addComment
);

router.delete(
    '/:id/comments/:commentId',
    verifyToken,
    deleteComment
);


module.exports = router;