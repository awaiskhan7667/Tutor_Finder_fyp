const express = require("express");
const router  = express.Router();

const {
  getAdminStats,
  getAdminUsers,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getAdminTutors,
  setTutorApproval,
  deleteTutorAdmin,
  getAdminBookings,
  forceCancelBooking,
  getAdminReviews,
  deleteReviewAdmin,
} = require("../controllers/admin.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

// All admin routes require login and "admin" role
router.use(protect, authorize("admin"));

// Stats
router.get("/stats", getAdminStats);

// Users
router.get("/users",             getAdminUsers);
router.put("/users/:id/status",  updateUserStatus);
router.put("/users/:id/role",    updateUserRole);
router.delete("/users/:id",      deleteUser);

// Tutors
router.get("/tutors",             getAdminTutors);
router.put("/tutors/:id/approval", setTutorApproval);
router.delete("/tutors/:id",      deleteTutorAdmin);

// Bookings
router.get("/bookings",           getAdminBookings);
router.put("/bookings/:id/cancel", forceCancelBooking);

// Reviews
router.get("/reviews",     getAdminReviews);
router.delete("/reviews/:id", deleteReviewAdmin);

module.exports = router;
