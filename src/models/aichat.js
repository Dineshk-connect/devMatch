// models/aichat.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const aiChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, default: "AI Conversation" },
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AIChat", aiChatSchema);
