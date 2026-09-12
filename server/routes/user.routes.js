const express = require("express");
const router  = express.Router();

const {
  updateAvatar,
  getProfile,
  updateProfile,
} = require("../controllers/user.controller");

const { protect } = require("../middleware/auth.middleware");
const upload      = require("../middleware/upload.middleware");

// ── Upload / update avatar ──
router.put("/avatar", protect, upload.single("avatar"), updateAvatar);

// ── Get user profile ──
router.get("/profile", protect, getProfile);

// ── Update profile (name, phone) ──
router.put("/profile", protect, updateProfile);

module.exports = router;