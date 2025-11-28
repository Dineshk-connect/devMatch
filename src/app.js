// src/app.js
// Single-file server (Express app + HTTP server + Socket.IO + DB)
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const initializeSocket = require("./utils/socket");

// Routers
const postRouter = require("./routes/post");
const authRouter = require("./routes/auth");
const userRouter = require("./routes/User");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");

const app = express();

// ---------- Middlewares ----------
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------- Health check ----------
app.get("/health", (req, res) => {
  return res.status(200).json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    time: new Date().toISOString(),
  });
});

// ---------- Mount routers ----------
app.use("/api/posts", postRouter);
app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

// 404 handler
app.use((req, res, next) => {
  return res
    .status(404)
    .json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ---------- Create HTTP server + DB + Socket ----------
// Keep server creation & socket initialization here so you don't need a separate server.js
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

connectDB()
  .then(() => {
    console.log("Database connected successfully");

    // initialize socket and attach io to app (initializeSocket returns io)
    // utils/socket.js signature: initializeSocket(server, app, opts)
    const io = initializeSocket(server, app, {
      corsOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    });

    // optional: you can access io from routes via req.app.get('io') because initializeSocket attaches it
    if (!app.get("io") && io) app.set("io", io);

    server.listen(PORT, () => {
      console.log(`Server is running successfully on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed", err);
    process.exit(1);
  });

// Export app if other tools/tests need it
module.exports = app;
