// src/routes/post.js
const express = require("express");
const { userAuth } = require("../middlewares/auth");
const Post = require("../models/post");
const ConnectionRequest = require("../models/ConnectionRequest");
const upload = require("../utils/multer");
const cloudinary = require("../config/cloudinary");

const postRouter = express.Router();
console.log("🟢 Post routes file loaded");

// --------------------------------------------------
// Create a new post
// --------------------------------------------------
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
    // populate author fields for frontend convenience
    const populated = await Post.findById(savedPost._id).populate(
      "author",
      "firstName lastName photoUrl skills"
    );

    return res.status(201).json({ success: true, post: populated });
  } catch (error) {
    console.error("❌ POST ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------
// Get posts feed or user's posts
// --------------------------------------------------
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
      conn.fromUserId.toString() === currentUserId.toString() ? conn.toUserId : conn.fromUserId
    );

    const posts = await Post.find({
      author: { $ne: currentUserId }, // exclude own posts in feed
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

// --------------------------------------------------
// Toggle Like
// PUT /api/posts/:postId/like
// returns { postId, likesCount, likedByCurrentUser }
// --------------------------------------------------
postRouter.put("/:postId/like", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const idx = post.likes.findIndex((id) => id.toString() === userId.toString());
    let likedByCurrentUser = false;
    if (idx === -1) {
      // add like
      post.likes.push(userId);
      likedByCurrentUser = true;
    } else {
      // remove like
      post.likes.splice(idx, 1);
      likedByCurrentUser = false;
    }

    await post.save();

    const likesCount = post.likes.length;

    // emit socket event if io available
    const io = req.app.get("io");
    if (io) {
      io.emit("post:liked", { postId, likesCount, likedByCurrentUser, userId });
    }

    return res.status(200).json({ success: true, postId, likesCount, likedByCurrentUser });
  } catch (error) {
    console.error("❌ TOGGLE LIKE ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------
// Fetch Comments (paginated)
// GET /api/posts/:postId/comments?page=1&limit=5
// Response: { comments: [...], page, limit, total }
// --------------------------------------------------
postRouter.get("/:postId/comments", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = Math.max(parseInt(req.query.limit || "5", 10), 1);

    const post = await Post.findById(postId).populate({
      path: "comments.author",
      model: "User",
      select: "firstName lastName photoUrl",
    });

    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const total = post.comments.length;
    // sort comments by createdAt desc (newest first)
    const sorted = post.comments
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);

    const start = (page - 1) * limit;
    const paginated = sorted.slice(start, start + limit);

    // convert subdocs to plain objects for safety
    const comments = paginated.map((c) => ({
      _id: c._id,
      author: c.author,
      text: c.text,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    return res.status(200).json({ success: true, comments, page, limit, total });
  } catch (error) {
    console.error("❌ GET COMMENTS ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------
// Add Comment
// POST /api/posts/:postId/comments
// Body: { text }
// Response: { postId, comment }
// --------------------------------------------------
postRouter.post("/:postId/comments", userAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = {
      author: userId,
      text: text.trim(),
      createdAt: new Date(),
    };

    post.comments.push(comment);
    await post.save();

    // populate the last pushed comment's author
    const populatedPost = await Post.findById(post._id).populate({
      path: "comments.author",
      model: "User",
      select: "firstName lastName photoUrl",
    });

    const createdComment = populatedPost.comments[populatedPost.comments.length - 1];

    // emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("post:commented", { postId, comment: createdComment });
    }

    // Return comment along with postId to frontend reducer expectation
    return res.status(201).json({ success: true, postId: post._id, comment: createdComment });
  } catch (error) {
    console.error("❌ ADD COMMENT ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------
// Edit Comment (author only)
// PUT /api/posts/:postId/comments/:commentId
// Body: { text }
// --------------------------------------------------
postRouter.put("/:postId/comments/:commentId", userAuth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    if (comment.author.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized to edit this comment" });
    }

    comment.text = text.trim();
    comment.updatedAt = new Date();
    await post.save();

    // populate comment author
    const populated = await Post.findById(postId).populate({
      path: "comments.author",
      model: "User",
      select: "firstName lastName photoUrl",
    });

    const updatedComment = populated.comments.id(commentId);

    return res.status(200).json({ success: true, comment: updatedComment });
  } catch (error) {
    console.error("❌ EDIT COMMENT ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// --------------------------------------------------
// Delete Comment (comment author OR post author)
// DELETE /api/posts/:postId/comments/:commentId
// --------------------------------------------------
postRouter.delete("/:postId/comments/:commentId", userAuth, async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

    const isCommentAuthor = comment.author.toString() === userId.toString();
    const isPostAuthor = post.author.toString() === userId.toString();

    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this comment" });
    }

    comment.remove();
    await post.save();

    // emit socket event
    const io = req.app.get("io");
    if (io) {
      io.emit("post:commentDeleted", { postId, commentId });
    }

    return res.status(200).json({ success: true, postId, commentId });
  } catch (error) {
    console.error("❌ DELETE COMMENT ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = postRouter;
