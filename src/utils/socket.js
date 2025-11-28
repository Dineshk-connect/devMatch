// utils/socket.js
const socketIo = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

const getSecretRoomId = (userId, targetUserId) =>
  crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");

const initializeSocket = (server, app = null, opts = {}) => {
  const corsOrigin = opts.corsOrigin || process.env.CLIENT_ORIGIN || "http://localhost:5173";

  const io = socketIo(server, {
    cors: { origin: corsOrigin },
  });

  if (app && typeof app.set === "function") {
    app.set("io", io);
  }

  const userSockets = new Map();

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    const registerUserSocket = (userId) => {
      if (!userId) return;
      const set = userSockets.get(userId) || new Set();
      set.add(socket.id);
      userSockets.set(userId, set);
      socket.join(userId.toString());
    };

    socket.on("disconnect", () => {
      for (const [uid, set] of userSockets.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          if (set.size === 0) userSockets.delete(uid);
          else userSockets.set(uid, set);
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });

    socket.on("joinChat", ({ firstName, userId, targetUserId, chatId } = {}) => {
      if (!userId) return;
      registerUserSocket(userId);

      if (userId && targetUserId) {
        const secretRoom = getSecretRoomId(userId, targetUserId);
        socket.join(secretRoom);
        console.log(`${firstName || userId} joined secret room: ${secretRoom}`);
      }

      if (chatId) {
        socket.join(`chat_${chatId}`);
        console.log(`${firstName || userId} joined chat_${chatId}`);
      }
    });

    socket.on("typing", ({ fromUserId, toUserId, chatId, typing = false } = {}) => {
      try {
        if (toUserId) io.to(toUserId.toString()).emit("typing", { fromUserId, typing });
        if (chatId) io.to(`chat_${chatId}`).emit("typing", { fromUserId, typing });
        else if (fromUserId && toUserId) io.to(getSecretRoomId(fromUserId, toUserId)).emit("typing", { fromUserId, typing });
      } catch (err) {
        console.error("typing relay error:", err);
      }
    });

    socket.on("sendMessage", async (payload = {}) => {
      const { senderId, userId, firstName, lastName, targetUserId, text, chatId, localTempId } = payload;
      const fromId = senderId || userId;
      if (!fromId || !targetUserId || !text || !text.trim()) {
        socket.emit("messageError", { error: "Invalid message payload" });
        return;
      }

      try {
        let chat = await Chat.findOne({ participants: { $all: [fromId, targetUserId] } });

        if (!chat) {
          chat = new Chat({ participants: [fromId, targetUserId], messages: [] });
        }

        chat.messages.push({ senderId: fromId, text: text.trim(), createdAt: new Date() });
        await chat.save();

        const populated = await Chat.findById(chat._id).populate({
          path: "messages.senderId",
          model: "User",
          select: "firstName lastName",
        });

        const savedMessage = populated.messages[populated.messages.length - 1];

        const roomByChatId = chatId ? `chat_${chatId}` : `chat_${chat._id.toString()}`;
        const secretRoom = getSecretRoomId(fromId, targetUserId);

        io.to(roomByChatId).emit("messageReceived", savedMessage);
        io.to(secretRoom).emit("messageReceived", savedMessage);
        io.to(targetUserId.toString()).emit("messageReceived", savedMessage);

        // ack back to sender so client can replace optimistic
        io.to(fromId.toString()).emit("messageSentAck", { localTempId, savedMessage });
      } catch (err) {
        console.error("sendMessage error:", err);
        socket.emit("messageError", { error: err.message || "Failed to send message" });
      }
    });
  });

  return io;
};

module.exports = initializeSocket;
module.exports.getSecretRoomId = getSecretRoomId;
