const express = require("express");
const router = express.Router();

const { verifyToken } = require("../middleware/authMiddleware");
const {
  getProfile,
  changePassword,
  changeEmail,
} = require("../controllers/atasan_profileController");

router.get("/", verifyToken, getProfile);

router.put("/:id/password", verifyToken, changePassword);

router.put("/:id/email", verifyToken, changeEmail);

module.exports = router;