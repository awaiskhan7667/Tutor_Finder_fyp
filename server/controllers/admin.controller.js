const User         = require("../models/User.model");
const Tutor        = require("../models/Tutor.model");
const Booking      = require("../models/Booking.model");
const Review        = require("../models/Review.model");
const Notification  = require("../models/Notification.model");

// Lazily require io to avoid circular-require issues at module load time
const getIo = () => require("../server").io;

const notify = async ({ recipient, sender, type, title, message, bookingId }) => {
  try {
    const n = await Notification.create({ recipient, sender, type, title, message, bookingId });
    getIo().emit("receiveNotification", { ...n._doc, recipient: recipient.toString() });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// ═════════════════════════════════════════
//  DASHBOARD STATS
//  GET /api/admin/stats
// ═════════════════════════════════════════
const getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalStudents,
      totalTutors,
      pendingApprovals,
      totalBookings,
      pendingBookings,
      completedBookings,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      Tutor.countDocuments(),
      Tutor.countDocuments({ isApproved: false }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "completed" }),
      Review.countDocuments(),
    ]);

    const revenueAgg = await Booking.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalStudents,
        totalTutors,
        pendingApprovals,
        totalBookings,
        pendingBookings,
        completedBookings,
        totalReviews,
        totalRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═════════════════════════════════════════
//  USER MANAGEMENT
// ═════════════════════════════════════════

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, isActive, search } = req.query;
    let filter = {};

    if (role)     filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (search) {
      filter.$or = [
        { name:  new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
      ];
    }

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/status  { isActive }
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

// PUT /api/admin/users/:id/role  { role }
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["student", "tutor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
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

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "You can't delete your own account" });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Clean up related tutor profile if any
    await Tutor.findOneAndDelete({ user: req.params.id });

    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═════════════════════════════════════════
//  TUTOR MANAGEMENT
// ═════════════════════════════════════════

// GET /api/admin/tutors
const getAllTutorsAdmin = async (req, res) => {
  try {
    const { isApproved } = req.query;
    let filter = {};
    if (isApproved !== undefined) filter.isApproved = isApproved === "true";

    const tutors = await Tutor.find(filter)
      .populate("user", "name email phone avatar isActive")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tutors.length, tutors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/tutors/:id/approval  { isApproved }
const setTutorApproval = async (req, res) => {
  try {
    const { isApproved } = req.body;
    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true }
    ).populate("user", "name email");

    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    await notify({
      recipient: tutor.user._id,
      sender:    req.user.id,
      type:      "general",
      title:     isApproved ? "✅ Profile Approved!" : "⚠️ Profile Approval Revoked",
      message:   isApproved
        ? "Your tutor profile has been approved and is now visible to students."
        : "Your tutor profile approval has been revoked. Please contact support.",
    });

    res.status(200).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/tutors/:id
const deleteTutorAdmin = async (req, res) => {
  try {
    const tutor = await Tutor.findByIdAndDelete(req.params.id);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });
    await User.findByIdAndUpdate(tutor.user, { role: "student" });
    res.status(200).json({ success: true, message: "Tutor profile deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═════════════════════════════════════════
//  BOOKING OVERSIGHT
// ═════════════════════════════════════════

// GET /api/admin/bookings
const getAllBookingsAdmin = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("student", "name email")
      .populate({ path: "tutor", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/bookings/:id/cancel
const forceCancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true }
    ).populate("student").populate({ path: "tutor", populate: { path: "user" } });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    await notify({
      recipient: booking.student._id,
      sender:    req.user.id,
      type:      "booking_cancelled",
      title:     "❌ Booking Cancelled by Admin",
      message:   `Your ${booking.subject} session was cancelled by an administrator.`,
      bookingId: booking._id,
    });
    if (booking.tutor?.user?._id) {
      await notify({
        recipient: booking.tutor.user._id,
        sender:    req.user.id,
        type:      "booking_cancelled",
        title:     "❌ Booking Cancelled by Admin",
        message:   `A ${booking.subject} session was cancelled by an administrator.`,
        bookingId: booking._id,
      });
    }

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ═════════════════════════════════════════
//  REVIEW MODERATION
// ═════════════════════════════════════════

// GET /api/admin/reviews
const getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("student", "name email")
      .populate({ path: "tutor", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/reviews/:id  (admin can delete ANY review, unlike student's own-only delete)
const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  updateUserStatus, 
  updateUserRole, 
  deleteUser,
  getAllTutorsAdmin, 
  setTutorApproval, 
  deleteTutorAdmin,
  getAllBookingsAdmin, 
  forceCancelBooking,
  getAllReviewsAdmin, 
  deleteReviewAdmin,
};
