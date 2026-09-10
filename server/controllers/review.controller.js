const Review  = require("../models/Review.model");
const Booking = require("../models/Booking.model");
const Tutor   = require("../models/Tutor.model");

// ─────────────────────────────────────────
//  CREATE REVIEW
//  POST /api/reviews
// ─────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    // Check booking exists and is completed
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed sessions" });
    }
    if (booking.student.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to review this session" });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ message: "You already reviewed this session" });
    }

    const review = await Review.create({
      tutor:   booking.tutor,
      student: req.user.id,
      booking: bookingId,
      rating,
      comment,
    });

    await review.populate("student", "name avatar");

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET REVIEWS FOR A TUTOR
//  GET /api/reviews/tutor/:tutorId
// ─────────────────────────────────────────
const getTutorReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ tutor: req.params.tutorId })
      .populate("student", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  CHECK IF BOOKING IS REVIEWED
//  GET /api/reviews/check/:bookingId
// ─────────────────────────────────────────
const checkReviewed = async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId });
    res.status(200).json({ success: true, reviewed: !!review, review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  DELETE REVIEW
//  DELETE /api/reviews/:id
// ─────────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id, student: req.user.id,
    });
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createReview, getTutorReviews, checkReviewed, deleteReview };