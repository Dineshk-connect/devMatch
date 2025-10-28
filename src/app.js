const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser"); 
const cors = require("cors");
require("dotenv").config();



app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    // methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // 👈 important
  })
);

// 👇 Add this line — it tells Express to respond to preflight requests
// app.options(/.*/, cors());

app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const userRouter = require("./routes/User");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => {
      console.log("Server is running successfully on port 3000");
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
