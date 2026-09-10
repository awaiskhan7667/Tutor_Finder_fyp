const express = require("express");
const router  = express.Router();

const {
  createBooking,
  getMyBookings,
  getTutorBookings,
  updateBookingStatus,
  cancelBooking,
} = require("../controllers/booking.controller");

const { protect } = require("../middleware/auth.middleware");

// All routes are protected
router.post("/",                protect, createBooking);
router.get("/my",               protect, getMyBookings);
router.get("/tutor",            protect, getTutorBookings);
router.put("/:id/status",       protect, updateBookingStatus);
router.put("/:id/cancel",       protect, cancelBooking);

module.exports = router;