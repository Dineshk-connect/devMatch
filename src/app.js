// src/app.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");

// ⬇️ Routers
const postRouter = require("./routes/post");     // make sure file is src/routes/post.js (lowercase)
const authRouter = require("./routes/auth");
const userRouter = require("./routes/User");     // keep casing as your file name
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

const app = express();

// ---------- Core middlewares ----------
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded (helps when forms send text fields)
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// ---------- Quick health check ----------
app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// ---------- IMPORTANT: mount specific routes FIRST ----------
app.use("/api/posts", postRouter); // /api/posts, /api/posts/upload-test, etc.

// ---------- Other root-level routers ----------
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// ---------- 404 handler (for unmatched routes) ----------
app.use((req, res, next) => {
  return res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ---------- Centralized error handler ----------
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------- Server + DB ----------
const server = http.createServer(app);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    initializeSocket(server);
    server.listen(3000, () => {
      console.log("Server is running successfully on port 3000");
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

module.exports = app;
