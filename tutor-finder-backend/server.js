const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const http       = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app    = express();
const server = http.createServer(app);

// ─────────────────────────────────────────
//  SOCKET.IO SETUP
// ─────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
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
app.use(cors({ origin: "http://localhost:5173" }));

// Serve uploaded images statically
app.use("/uploads", express.static("uploads"));

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

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB error:", err));