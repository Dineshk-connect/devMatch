const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const ConnectionRequest = require("../models/ConnectionRequest"); // ✅ include this
const upload = require("../utils/multer");
const cloudinary = require("../config/cloudinary");

const postRouter = express.Router();
console.log("🟢 Post routes file loaded");

// Create a new post
postRouter.post("/", userAuth, upload.single("image"), async (req, res) => {
  try {
    const { content, link, visibility = "public" } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }

    let imageUrl = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "devcomrades_posts",
      });
      imageUrl = uploadResult.secure_url;
    }

    const newPost = new Post({
      author: req.user._id,
      content,
      link,
      imageUrl,
      visibility,
    });

    const savedPost = await newPost.save();
    return res.status(201).json({ success: true, post: savedPost });
  } catch (error) {
    console.error("❌ POST ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Get posts feed
// src/routes/post.js

postRouter.get("/", userAuth, async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { author } = req.query;

    if (author) {
      // Fetch specific user's posts (for profile page)
      const userPosts = await Post.find({
        author,
        visibility: { $in: ["public", "connections"] },
      })
        .populate("author", "firstName lastName photoUrl skills")
        .sort({ createdAt: -1 });

      return res.status(200).json({ success: true, posts: userPosts });
    }

    // Otherwise fetch main feed posts (exclude current user's posts)
    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: currentUserId, status: "accepted" },
        { toUserId: currentUserId, status: "accepted" },
      ],
    });

    const connectedUserIds = connections.map((conn) =>
      conn.fromUserId.toString() === currentUserId.toString()
        ? conn.toUserId
        : conn.fromUserId
    );

    const posts = await Post.find({
      author: { $ne: currentUserId }, // 👈 add this line to exclude self-posts
      $or: [
        { visibility: "public" },
        { visibility: "connections", author: { $in: connectedUserIds } },
      ],
    })
      .populate("author", "firstName lastName photoUrl skills")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, posts });
  } catch (error) {
    console.error("❌ GET POSTS ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching posts",
    });
  }
});





module.exports = postRouter;
