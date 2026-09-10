const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Tutor",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "Booking",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Please write a comment"],
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// ── One review per booking only ──
ReviewSchema.index({ booking: 1 }, { unique: true });

// ── Auto update tutor rating after save ──
ReviewSchema.statics.calcAverageRating = async function (tutorId) {
  const result = await this.aggregate([
    { $match: { tutor: tutorId } },
    { $group: {
        _id:          "$tutor",
        avgRating:    { $avg: "$rating" },
        totalReviews: { $sum: 1 },
    }},
  ]);

  if (result.length > 0) {
    await mongoose.model("Tutor").findByIdAndUpdate(tutorId, {
      rating:       Math.round(result[0].avgRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await mongoose.model("Tutor").findByIdAndUpdate(tutorId, {
      rating: 0, totalReviews: 0,
    });
  }
};

// ── Trigger after save ──
ReviewSchema.post("save", function () {
  this.constructor.calcAverageRating(this.tutor);
});

// ── Trigger after delete ──
ReviewSchema.post("findOneAndDelete", function (doc) {
  if (doc) doc.constructor.calcAverageRating(doc.tutor);
});

module.exports = mongoose.model("Review", ReviewSchema);