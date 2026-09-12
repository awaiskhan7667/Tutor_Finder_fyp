const express = require("express");
const router  = express.Router();

const {
  getStats,
  getAllUsers, updateUserStatus, updateUserRole, deleteUser,
  getAllTutorsAdmin, setTutorApproval, deleteTutorAdmin,
  getAllBookingsAdmin, forceCancelBooking,
  getAllReviewsAdmin, deleteReviewAdmin,
} = require("../controllers/admin.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

// Every route below requires a logged-in admin
router.use(protect, authorize("admin"));

// ── Dashboard ──
router.get("/stats", getStats);

// ── Users ──
router.get("/users",              getAllUsers);
router.put("/users/:id/status",   updateUserStatus);
router.put("/users/:id/role",     updateUserRole);
router.delete("/users/:id",       deleteUser);

// ── Tutors ──
router.get("/tutors",             getAllTutorsAdmin);
router.put("/tutors/:id/approval", setTutorApproval);
router.delete("/tutors/:id",      deleteTutorAdmin);

// ── Bookings ──
router.get("/bookings",           getAllBookingsAdmin);
router.put("/bookings/:id/cancel", forceCancelBooking);

// ── Reviews ──
router.get("/reviews",            getAllReviewsAdmin);
router.delete("/reviews/:id",     deleteReviewAdmin);

module.exports = router;
