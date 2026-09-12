const express = require("express");
const router  = express.Router();

const {
  createTutor,
  getAllTutors,
  getMyTutorProfile,
  getTutor,
  updateTutor,
  deleteTutor,
} = require("../controllers/tutor.controller");

const { protect } = require("../middleware/auth.middleware");

// Public routes
router.get("/", getAllTutors);

// Protected routes (profile/me must precede :id)
router.get("/profile/me", protect, getMyTutorProfile);
router.post("/",          protect, createTutor);
router.put("/:id",        protect, updateTutor);
router.delete("/:id",     protect, deleteTutor);

// Public single tutor by ID
router.get("/:id", getTutor);

module.exports = router;