const express = require("express");
const router = express.Router();

const {
  getComments,
  addComment,
} = require("../controllers/atasan_commentController");

router.get("/:requestId", getComments);

router.post("/", addComment);

module.exports = router;