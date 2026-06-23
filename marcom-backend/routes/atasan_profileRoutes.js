const express = require("express");

const router =
  express.Router();

const {
  verifyToken,
} = require(
  "../middleware/authMiddleware"
);

const {
  getProfile,
  changePassword,
  changeEmail,
} = require(
  "../controllers/atasan_profileController"
);

router.get(
  "/",
  verifyToken,
  getProfile
);

router.put(
  "/change-password",
  verifyToken,
  changePassword
);

router.put(
  "/change-email",
  verifyToken,
  changeEmail
);

module.exports =
  router;