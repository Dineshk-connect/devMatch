// src/models/post.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date },
  },
  { _id: true }
);

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

    // --- Likes: array of user ids ---
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // --- Comments as subdocuments ---
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Virtuals or helpers (optional) could be added here if desired

module.exports = mongoose.model("Post", postSchema);
