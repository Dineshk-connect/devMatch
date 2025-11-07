const express = require("express");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const chatRouter = express.Router();

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    // 🔍 find chat between the two users
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate({
        path: "participants",
        model: "User",
        select: "firstName lastName",
      })
      .populate({
        path: "messages.senderId",
        model: "User",
        select: "firstName lastName",
      });

    // 💡 if no chat found, create one
    if (!chat) {
      chat = new Chat({
        participants: [userId, targetUserId],
        messages: [],
      });
      await chat.save();

      // repopulate after save
      chat = await Chat.findById(chat._id)
        .populate({
          path: "participants",
          model: "User",
          select: "firstName lastName",
        })
        .populate({
          path: "messages.senderId",
          model: "User",
          select: "firstName lastName",
        });
    }

    console.log("✅ Chat data:", JSON.stringify(chat, null, 2));
    res.json(chat);
  } catch (err) {
    console.error("❌ Chat route error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = chatRouter;
