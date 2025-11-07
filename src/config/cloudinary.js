// src/config/cloudinary.js
require("dotenv").config();
const cloudinary = require("cloudinary").v2;  // ✅ v2 is required here

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("✅ Cloudinary Config Loaded:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "DEFINED" : "MISSING",
});

module.exports = cloudinary; // ✅ export v2 instance
