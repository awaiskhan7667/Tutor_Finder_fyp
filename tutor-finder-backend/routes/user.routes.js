const express  = require("express");
const router   = express.Router();
const path     = require("path");
const fs       = require("fs");
const User     = require("../models/User.model");
const { protect }  = require("../middleware/auth.middleware");
const upload       = require("../middleware/upload.middleware");

// ── Upload / update avatar ──
router.put("/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user.id);

    // Delete old avatar if exists
    if (user.avatar) {
      const oldPath = path.join(__dirname, "..", user.avatar);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    // Save new avatar path
    const avatarPath = `uploads/avatars/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({ success: true, avatar: avatarPath, message: "Avatar updated!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Get user profile ──
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Update profile (name, phone) ──
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;