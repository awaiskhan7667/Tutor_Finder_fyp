const mongoose = require("mongoose");
const Tutor    = require("../models/Tutor.model");
const User     = require("../models/User.model");

// ─────────────────────────────────────────
//  CREATE TUTOR PROFILE
//  POST /api/tutors
// ─────────────────────────────────────────
const createTutor = async (req, res) => {
  try {
    // Check if tutor profile already exists
    const existing = await Tutor.findOne({ user: req.user.id });
    if (existing) {
      return res.status(400).json({ message: "Tutor profile already exists" });
    }

    const tutor = await Tutor.create({
      user: req.user.id,
      ...req.body,
    });

    // Update user role to tutor
    await User.findByIdAndUpdate(req.user.id, { role: "tutor" });

    res.status(201).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET ALL TUTORS (with search & filter)
//  GET /api/tutors
// ─────────────────────────────────────────
const getAllTutors = async (req, res) => {
  try {
    const { subject, location, minRate, maxRate, teachingMode } = req.query;

    let filter = {};

    if (subject)      filter.subjects      = { $in: [new RegExp(subject, "i")] };
    if (location)     filter.location      = new RegExp(location, "i");
    if (teachingMode) filter.teachingMode  = teachingMode;
    if (minRate || maxRate) {
      filter.hourlyRate = {};
      if (minRate) filter.hourlyRate.$gte = Number(minRate);
      if (maxRate) filter.hourlyRate.$lte = Number(maxRate);
    }

    const tutors = await Tutor.find(filter)
      .populate("user", "name email avatar phone")
      .sort({ rating: -1 });

    res.status(200).json({ success: true, count: tutors.length, tutors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET LOGGED-IN TUTOR'S OWN PROFILE
//  GET /api/tutors/profile/me
// ─────────────────────────────────────────
const getMyTutorProfile = async (req, res) => {
  try {
    const tutor = await Tutor.findOne({ user: req.user.id })
      .populate("user", "name email avatar phone");

    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    res.status(200).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  GET SINGLE TUTOR
//  GET /api/tutors/:id
// ─────────────────────────────────────────
const getTutor = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    const tutor = await Tutor.findById(req.params.id)
      .populate("user", "name email avatar phone");

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    res.status(200).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  UPDATE TUTOR PROFILE
//  PUT /api/tutors/:id
// ─────────────────────────────────────────
const updateTutor = async (req, res) => {
  try {
    const tutor = await Tutor.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Tutor profile not found" });
    }

    res.status(200).json({ success: true, tutor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
//  DELETE TUTOR PROFILE
//  DELETE /api/tutors/:id
// ─────────────────────────────────────────
const deleteTutor = async (req, res) => {
  try {
    await Tutor.findOneAndDelete({ user: req.user.id });
    await User.findByIdAndUpdate(req.user.id, { role: "student" });
    res.status(200).json({ success: true, message: "Tutor profile deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTutor,
  getAllTutors,
  getMyTutorProfile,
  getTutor,
  updateTutor,
  deleteTutor,
};