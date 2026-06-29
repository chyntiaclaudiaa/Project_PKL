const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  getSummary,
  getStatusDistribution,
  getWorkload,
  getPriorityRequests,
  getCommentNotifications, 
  markNotificationAsRead   
} = require("../controllers/atasan_dashboardController");

router.get("/summary", verifyToken, getSummary);
router.get("/status-distribution", verifyToken, getStatusDistribution);
router.get("/workload", verifyToken, getWorkload);
router.get("/priority", verifyToken, getPriorityRequests);


router.get("/notifications", verifyToken, getCommentNotifications);
router.put("/notifications/:id/read", verifyToken, markNotificationAsRead);

module.exports = router;