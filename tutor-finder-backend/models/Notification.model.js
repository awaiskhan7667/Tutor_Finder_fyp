const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
    },
    type: {
      type: String,
      enum: [
        "booking_request",   // student → tutor
        "booking_accepted",  // tutor   → student
        "booking_rejected",  // tutor   → student
        "booking_cancelled", // student → tutor
        "booking_completed", // tutor   → student
        "general",
      ],
      default: "general",
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Booking",
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", NotificationSchema);