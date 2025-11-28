// routes/chat.js
const express = require("express");
const crypto = require("crypto");
const { userAuth } = require("../middlewares/auth");
const { Chat } = require("../models/chat");
const User = require("../models/user");

const chatRouter = express.Router();

const getSecretRoomId = (a, b) =>
  crypto.createHash("sha256").update([a, b].sort().join("_")).digest("hex");

chatRouter.get("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chat.findOne({
      participants: { $all: [userId, targetUserId] },
    })
      .populate({ path: "participants", model: "User", select: "firstName lastName" })
      .populate({ path: "messages.senderId", model: "User", select: "firstName lastName" });

    if (!chat) {
      chat = new Chat({ participants: [userId, targetUserId], messages: [] });
      await chat.save();

      chat = await Chat.findById(chat._id)
        .populate({ path: "participants", model: "User", select: "firstName lastName" })
        .populate({ path: "messages.senderId", model: "User", select: "firstName lastName" });
    }

    return res.json(chat);
  } catch (err) {
    console.error("❌ Chat route error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// POST to persist a message and emit via socket if available
chatRouter.post("/chat/:targetUserId", userAuth, async (req, res) => {
  const { targetUserId } = req.params;
  const { text } = req.body;
  const senderId = req.user._id;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Message text is required" });
  }

  try {
    let chat = await Chat.findOne({ participants: { $all: [senderId, targetUserId] } });

    if (!chat) {
      chat = new Chat({ participants: [senderId, targetUserId], messages: [] });
    }

    chat.messages.push({ senderId, text: text.trim(), createdAt: new Date() });
    await chat.save();

    const populated = await Chat.findById(chat._id)
      .populate({ path: "participants", model: "User", select: "firstName lastName" })
      .populate({ path: "messages.senderId", model: "User", select: "firstName lastName" });

    const savedMessage = populated.messages[populated.messages.length - 1];

    // emit via socket.io if available (io was attached to app in server.js)
    const io = req.app.get("io");
    if (io) {
      io.to(`chat_${chat._id.toString()}`).emit("messageReceived", savedMessage);
      io.to(getSecretRoomId(senderId.toString(), targetUserId.toString())).emit("messageReceived", savedMessage);
      io.to(targetUserId.toString()).emit("messageReceived", savedMessage);
    }

    return res.json({ message: savedMessage });
  } catch (err) {
    console.error("❌ POST /chat error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = chatRouter;
