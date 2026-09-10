const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth.middleware");
const Notification = require("../models/Notification.model");

// GET my notifications
router.get("/", protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("sender", "name");
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET unread count
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false,
    });
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MARK all as read
router.put("/mark-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );
    res.json({ success: true, message: "All marked as read" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// MARK one as read
router.put("/:id/read", protect, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE all
router.delete("/clear", protect, async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user.id });
    res.json({ success: true, message: "Cleared all notifications" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;