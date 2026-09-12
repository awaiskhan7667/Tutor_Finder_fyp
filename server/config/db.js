const mongoose = require("mongoose");

// ─────────────────────────────────────────
//  CONNECT TO MONGODB (Atlas or local)
// ─────────────────────────────────────────
const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/tutorfinder";

  try {
    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("👉 Tip: Check your MONGO_URI in server/.env or start MongoDB locally / via Docker.");
    process.exit(1);
  }
};

module.exports = connectDB;