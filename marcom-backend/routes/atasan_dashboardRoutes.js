const express = require("express");
const router = express.Router();

const {
  getSummary,
  getStatusDistribution,
  getWorkload,
  getPriorityRequests,
} = require("../controllers/atasan_dashboardController");

router.get("/summary", getSummary);

router.get("/status-distribution", getStatusDistribution);

router.get("/workload", getWorkload);

router.get("/priority", getPriorityRequests);

module.exports = router;