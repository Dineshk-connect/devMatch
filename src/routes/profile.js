const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const { v2: cloudinary } = require("cloudinary");

// 🧠 Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 📦 Multer (temporary storage)
const upload = multer({ dest: "uploads/" });

// 🧾 GET: View Profile
profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    res.send(req.user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// ✏️ PATCH: Edit Profile
profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const LoggedInUser = req.user;
    Object.keys(req.body).forEach((key) => (LoggedInUser[key] = req.body[key]));

    await LoggedInUser.save();

    res.json({
      message: `${LoggedInUser.firstName}, your profile updated successfully`,
      data: LoggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// 🔐 POST: Change Password
profileRouter.post("/profile/password/change", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }

    const isMatch = await LoggedInUser.validatePassword(oldPassword);
    if (!isMatch) throw new Error("Old password is incorrect");
    if (oldPassword === newPassword)
      throw new Error("New password must be different from old password");

    const passwordHash = await bcrypt.hash(newPassword, 10);
    LoggedInUser.password = passwordHash;

    await LoggedInUser.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

// 🖼️ POST: Upload Profile Photo (Cloudinary)
profileRouter.post(
  "/profile/upload-photo",
  userAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const filePath = req.file.path;

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "devcomrades/profile_photos",
        transformation: [{ width: 500, height: 500, crop: "fill" }],
      });

      // Delete local temp file
      fs.unlinkSync(filePath);

      // Send URL to frontend
      res.json({ imageUrl: result.secure_url });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ message: "Failed to upload image", error });
    }
  }
);

module.exports = profileRouter;
