const express = require("express");
const router = express.Router();

const {
  getAllRequests,
  getRequestById,
  updateRequestStatus,
  togglePriority,
} = require("../controllers/atasan_requestController");

router.get("/", getAllRequests);

router.get("/:id", getRequestById);

router.patch("/:id/status", updateRequestStatus);

router.patch("/:id/priority", togglePriority);

module.exports = router;