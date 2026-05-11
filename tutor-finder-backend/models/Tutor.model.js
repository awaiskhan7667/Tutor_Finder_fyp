const mongoose = require("mongoose");

const TutorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subjects: {
      type: [String],
      required: [true, "At least one subject is required"],
    },
    bio: {
      type: String,
      required: [true, "Bio is required"],
      maxlength: 500,
    },
    hourlyRate: {
      type: Number,
      required: [true, "Hourly rate is required"],
    },
    experience: {
      type: Number, // years of experience
      default: 0,
    },
    education: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    teachingMode: {
      type: String,
      enum: ["online", "in-person", "both"],
      default: "both",
    },
    languages: {
      type: [String],
      default: ["Urdu", "English"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isApproved: {
      type: Boolean,
      default: false, // admin approves tutors
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tutor", TutorSchema);