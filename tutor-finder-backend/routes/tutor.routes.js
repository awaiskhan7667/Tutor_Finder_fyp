const express = require("express");
const router  = express.Router();

const {
  createTutor,
  getAllTutors,
  getTutor,
  updateTutor,
  deleteTutor,
} = require("../controllers/tutor.controller");

const { protect, authorize } = require("../middleware/auth.middleware");

// Public routes
router.get("/",    getAllTutors);
router.get("/:id", getTutor);

// Protected routes
router.post("/",    protect, createTutor);
router.put("/:id",  protect, updateTutor);
router.delete("/:id", protect, deleteTutor);

module.exports = router;