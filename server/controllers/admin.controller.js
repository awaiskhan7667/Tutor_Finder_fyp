const User    = require("../models/User.model");
const Tutor   = require("../models/Tutor.model");
const Booking = require("../models/Booking.model");
const Review  = require("../models/Review.model");

// ─────────────────────────────────────────
//  GET ADMIN STATS
//  GET /api/admin/stats
// ─────────────────────────────────────────
const getAdminStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalTutors, totalBookings, totalReviews, completedBookings] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        Tutor.countDocuments(),
        Booking.countDocuments(),
        Review.countDocuments(),
        Booking.find({ status: "completed" }, "totalPrice"),
      ]);

    const totalRevenue = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    const pendingTutors = await Tutor.countDocuments({ isApproved: false });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTutors,
        pendingTutors,
        totalBookings,
        totalReviews,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET ADMIN USERS
//  GET /api/admin/users
// ─────────────────────────────────────────
const getAdminUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  UPDATE USER STATUS (Active / Inactive)
//  PUT /api/admin/users/:id/status
// ─────────────────────────────────────────
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  UPDATE USER ROLE
//  PUT /api/admin/users/:id/role
// ─────────────────────────────────────────
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "tutor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  DELETE USER
//  DELETE /api/admin/users/:id
// ─────────────────────────────────────────
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up associated tutor profile if exists
    await Tutor.findOneAndDelete({ user: req.params.id });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET ADMIN TUTORS
//  GET /api/admin/tutors
// ─────────────────────────────────────────
const getAdminTutors = async (req, res) => {
  try {
    const { isApproved } = req.query;
    let query = {};
    if (isApproved !== undefined && isApproved !== "") {
      query.isApproved = isApproved === "true";
    }

    const tutors = await Tutor.find(query)
      .populate("user", "name email avatar phone isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tutors.length, tutors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  SET TUTOR APPROVAL
//  PUT /api/admin/tutors/:id/approval
// ─────────────────────────────────────────
const setTutorApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate("user", "name email avatar");

    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    res.status(200).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  DELETE TUTOR (Admin)
//  DELETE /api/admin/tutors/:id
// ─────────────────────────────────────────
const deleteTutorAdmin = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    // Reset user's role to student
    await User.findByIdAndUpdate(tutor.user, { role: "student" });

    res.status(200).json({ success: true, message: "Tutor profile deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET ADMIN BOOKINGS
//  GET /api/admin/bookings
// ─────────────────────────────────────────
const getAdminBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("student", "name email avatar phone")
      .populate({
        path: "tutor",
        populate: { path: "user", select: "name email avatar" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  FORCE CANCEL BOOKING
//  PUT /api/admin/bookings/:id/cancel
// ─────────────────────────────────────────
const forceCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.status(200).json({ success: true, message: "Booking cancelled by admin", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET ADMIN REVIEWS
//  GET /api/admin/reviews
// ─────────────────────────────────────────
const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("student", "name email avatar")
      .populate({
        path: "tutor",
        populate: { path: "user", select: "name email" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  DELETE REVIEW (Admin)
//  DELETE /api/admin/reviews/:id
// ─────────────────────────────────────────
const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    // Recalculate average rating for tutor
    await Review.calcAverageRating(review.tutor);

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
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
};
