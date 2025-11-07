// src/utils/multer.js
const multer = require("multer");
const path = require("path");
const os = require("os"); // ✅ built-in module for temp dir

// ✅ Configure Multer to save files to OS temp folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, os.tmpdir()); // ✅ Safe temp folder on Windows/Mac/Linux
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (allowTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only .jpg, .jpeg, .png files are allowed"), false);
    }
  },
});

module.exports = upload;
