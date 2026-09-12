const express    = require("express");
const cors       = require("cors");
const dotenv     = require("dotenv");
const http       = require("http");
const path       = require("path");
const { Server } = require("socket.io");
const connectDB  = require("./config/db");

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────
//  CORS & ORIGINS CONFIGURATION
// ─────────────────────────────────────────
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((u) => u.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://tutor-finder-fyp.vercel.app",
  ...configuredOrigins,
];

const isOriginAllowed = (origin) => {
  if (!origin) return true; // Allow non-browser requests (Postman, mobile, server-to-server)
  const cleanOrigin = origin.replace(/\/+$/, "");
  if (allowedOrigins.includes(cleanOrigin)) return true;
  // Allow all Vercel preview and production deployments
  if (/^https:\/\/.*\.vercel\.app$/.test(cleanOrigin)) return true;
  return false;
};

// ─────────────────────────────────────────
//  SOCKET.IO SETUP
// ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Store online users { userId: socketId }
const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  // Register user when they log in
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    console.log("✅ Registered:", userId);
  });

  // Send notification to specific user
  socket.on("sendNotification", ({ toUserId, notification }) => {
    const targetSocket = onlineUsers[toUserId];
    if (targetSocket) {
      io.to(targetSocket).emit("receiveNotification", notification);
    }
  });

  socket.on("disconnect", () => {
    // Remove user from online list
    Object.keys(onlineUsers).forEach((uid) => {
      if (onlineUsers[uid] === socket.id) delete onlineUsers[uid];
    });
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Export io so routes can use it
module.exports.io = io;

// ─────────────────────────────────────────
//  MIDDLEWARE
// ─────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);

// Serve uploaded images statically with absolute path
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─────────────────────────────────────────
//  TEST ROUTE
// ─────────────────────────────────────────
app.post("/test", (req, res) => {
  res.json({ received: req.body });
});

// ─────────────────────────────────────────
//  ROUTES
// ─────────────────────────────────────────
app.use("/api/auth",          require("./routes/auth.routes"));
app.use("/api/users",         require("./routes/user.routes"));
app.use("/api/tutors",        require("./routes/tutor.routes"));
app.use("/api/bookings",      require("./routes/booking.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/reviews",       require("./routes/review.routes"));
app.use("/api/admin",         require("./routes/admin.routes"));

// ─────────────────────────────────────────
//  DEFAULT ROUTE
// ─────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "✅ Tutor Finder API is running!" });
});

// ─────────────────────────────────────────
//  START SERVER
// ─────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});