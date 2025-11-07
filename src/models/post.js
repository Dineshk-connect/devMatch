// src/models/Post.js
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxLength: 500,
    },
    imageUrl: {
      type: String, // URL from Cloudinary
      default: null,
    },
    link: {
      type: String, // Optional URL (like GitHub or blog link)
    },
    visibility: {
      type: String,
      enum: ["public", "connections"],
      default: "public",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
