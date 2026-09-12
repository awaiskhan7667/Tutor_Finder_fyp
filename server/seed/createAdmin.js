/**
 * One-time script to create (or promote) the first admin account.
 *
 * Usage:
 *   node seed/createAdmin.js "Admin Name" admin@example.com StrongPassword123
 *
 * If a user with that email already exists, it will be promoted to
 * role "admin" instead of erroring out.
 */
const dotenv    = require("dotenv");
const path      = require("path");
const mongoose  = require("mongoose");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const connectDB = require("../config/db");
const User      = require("../models/User.model");

const run = async () => {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.log("❌ Usage: node seed/createAdmin.js \"Admin Name\" admin@example.com StrongPassword123");
    process.exit(1);
  }

  await connectDB();

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.role = "admin";
      await user.save();
      console.log(`✅ Existing user "${user.email}" promoted to admin.`);
    } else {
      user = await User.create({ name, email, password, role: "admin" });
      console.log(`✅ Admin account created: ${user.email}`);
    }
  } catch (err) {
    console.error("❌ Failed to create admin:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
