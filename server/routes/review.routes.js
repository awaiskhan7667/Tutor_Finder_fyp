const express = require("express");
const router  = express.Router();
const { createReview, getTutorReviews, checkReviewed, deleteReview } = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/",                    protect, createReview);
router.get("/tutor/:tutorId",               getTutorReviews);
router.get("/check/:bookingId",     protect, checkReviewed);
router.delete("/:id",               protect, deleteReview);

module.exports = router;