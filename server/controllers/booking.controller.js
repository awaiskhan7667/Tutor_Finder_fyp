const Booking      = require("../models/Booking.model");
const Tutor        = require("../models/Tutor.model");
const Notification = require("../models/Notification.model");
const { io }       = require("../server");

// ── Helper: create & emit notification ──
const notify = async ({ recipient, sender, type, title, message, bookingId }) => {
  try {
    const n = await Notification.create({ recipient, sender, type, title, message, bookingId });
    // emit real-time
    io.emit("receiveNotification", { ...n._doc, recipient: recipient.toString() });
  } catch (err) {
    console.error("Notification error:", err.message);
  }
};

// ─────────────────────────────────────────
//  CREATE BOOKING
//  POST /api/bookings
// ─────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const { tutorId, subject, date, startTime, endTime, totalHours, teachingMode, message } = req.body;

    const tutor = await Tutor.findById(tutorId).populate("user");
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const totalPrice = tutor.hourlyRate * totalHours;
    const booking = await Booking.create({
      student: req.user.id, tutor: tutorId,
      subject, date, startTime, endTime,
      totalHours, totalPrice, teachingMode, message,
    });

    // Notify tutor
    await notify({
      recipient:  tutor.user._id,
      sender:     req.user.id,
      type:       "booking_request",
      title:      "📅 New Booking Request",
      message:    `A student wants to book a ${subject} session on ${new Date(date).toDateString()}`,
      bookingId:  booking._id,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET MY BOOKINGS (student)
// ─────────────────────────────────────────
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student: req.user.id })
      .populate({ path: "tutor", populate: { path: "user", select: "name email" } })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET TUTOR BOOKINGS
// ─────────────────────────────────────────
const getTutorBookings = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id });
    if (!tutor) return res.status(404).json({ message: "Tutor profile not found" });

    const bookings = await Booking.find({ tutor: tutor._id })
      .populate("student", "name email phone avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  UPDATE BOOKING STATUS
// ─────────────────────────────────────────
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id, { status }, { returnDocument: "after" }
    ).populate("student");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Notify student based on status
    const notifyMap = {
      accepted:  { type:"booking_accepted",  title:"✅ Booking Accepted!",   message:`Your ${booking.subject} session has been accepted! Click to join.` },
      rejected:  { type:"booking_rejected",  title:"❌ Booking Rejected",    message:`Your ${booking.subject} session request was rejected.` },
      completed: { type:"booking_completed", title:"🎓 Session Completed!",  message:`Your ${booking.subject} session has been marked as completed.` },
    };

    if (notifyMap[status]) {
      await notify({
        recipient: booking.student._id,
        sender:    req.user.id,
        ...notifyMap[status],
        bookingId: booking._id,
      });
    }

    res.status(200).json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  CANCEL BOOKING
// ─────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { _id: req.params.id, student: req.user.id },
      { status: "cancelled" },
      { returnDocument: "after" }
    ).populate({ path: "tutor", populate: { path: "user" } });

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Notify tutor
    await notify({
      recipient: booking.tutor.user._id,
      sender:    req.user.id,
      type:      "booking_cancelled",
      title:     "❌ Booking Cancelled",
      message:   `A student cancelled their ${booking.subject} session.`,
      bookingId: booking._id,
    });

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getTutorBookings, updateBookingStatus, cancelBooking };