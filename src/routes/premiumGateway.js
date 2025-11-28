// routes/premiumGateway.js
const express = require("express");
const axios = require("axios");
const { userAuth } = require("../middlewares/auth"); // your existing auth middleware
const AIChat = require("../models/aichat"); // separate model for AI conversations
const router = express.Router();

// requirePremium middleware
const requirePremium = (req, res, next) => {
  if (!req.user || !req.user.isPremium) {
    return res.status(403).json({ message: "Premium membership required" });
  }
  next();
};

// Helper to call DevMentor internal endpoint
// path should start with '/' e.g. "/ask"
const callDevMentor = async (path, body, serviceKey) => {
  const devMentorUrl = process.env.DEVMENTOR_URL || "http://localhost:5000";
  const url = `${devMentorUrl}/api/internal/gemini${path}`;
  const resp = await axios.post(url, body, {
    headers: {
      "x-service-key": serviceKey || process.env.DEVMENTOR_SERVICE_KEY,
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });
  return resp.data;
};

// POST /premium/ask
// body: { prompt, chatId? }
router.post("/ask", userAuth, requirePremium, async (req, res) => {
  try {
    const { prompt, chatId } = req.body;
    if (!prompt || !prompt.trim()) return res.status(400).json({ message: "Prompt required" });

    // find or create AIChat
    let chat = null;
    if (chatId) {
      chat = await AIChat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      if (chat.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
    } else {
      chat = new AIChat({ user: req.user._id, title: "AI Conversation", messages: [] });
    }

    // Save user's message (optimistic)
    chat.messages.push({ role: "user", text: prompt });
    chat.updatedAt = Date.now();
    await chat.save();

    // Proxy to DevMentor internal /ask
    const data = await callDevMentor("/ask", { prompt });

    const reply = data?.reply || data;

    // Save assistant reply
    chat.messages.push({ role: "assistant", text: reply });
    chat.updatedAt = Date.now();
    await chat.save();

    return res.json({ reply, chatId: chat._id });
  } catch (err) {
    console.error("premium/ask error:", err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.error || err.message || "Failed to fetch AI reply" });
  }
});

// POST /premium/analyze
// body: { code, language, chatId? }
router.post("/analyze", userAuth, requirePremium, async (req, res) => {
  try {
    const { code, language, chatId } = req.body;
    if (!code || !code.trim()) return res.status(400).json({ message: "Code is required" });

    const prompt = `Analyze the following ${language || "javascript"} code. Provide:\n1) bugs/security issues\n2) suggested fixes (with code)\n3) brief explanation and complexity considerations.\n\nCode:\n${code}`;

    // Optionally append to an existing conversation / or create new
    let chat = null;
    if (chatId) {
      chat = await AIChat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Conversation not found" });
      if (chat.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
      chat.messages.push({ role: "user", text: `<Code Analyze Request>\n${prompt}` });
    } else {
      chat = new AIChat({ user: req.user._id, title: "Code Analysis", messages: [{ role: "user", text: `<Code Analyze Request>\n${prompt}` }] });
    }
    await chat.save();

    const data = await callDevMentor("/ask", { prompt });
    const reply = data?.reply || data;

    chat.messages.push({ role: "assistant", text: reply });
    chat.updatedAt = Date.now();
    await chat.save();

    return res.json({ result: reply, chatId: chat._id });
  } catch (err) {
    console.error("premium/analyze error:", err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.error || err.message || "Failed to analyze code" });
  }
});

// POST /premium/roadmap
// body: { goal, level, chatId? }
router.post("/roadmap", userAuth, requirePremium, async (req, res) => {
  try {
    const { goal, level, chatId } = req.body;
    if (!goal || !goal.trim()) return res.status(400).json({ message: "Goal is required" });

    const lv = level || "beginner";
    const prompt = `Create a ${lv} learning roadmap for the following goal:\n\n"${goal}"\n\nDivide into 4-6 milestones with time estimates, resources, and key projects to build. Keep it actionable.`;

    let chat = null;
    if (chatId) {
      chat = await AIChat.findById(chatId);
      if (!chat) return res.status(404).json({ message: "Conversation not found" });
      if (chat.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });
      chat.messages.push({ role: "user", text: `<Roadmap Request>\n${prompt}` });
    } else {
      chat = new AIChat({ user: req.user._id, title: "Roadmap", messages: [{ role: "user", text: `<Roadmap Request>\n${prompt}` }] });
    }
    await chat.save();

    const data = await callDevMentor("/ask", { prompt });
    const reply = data?.reply || data;

    chat.messages.push({ role: "assistant", text: reply });
    chat.updatedAt = Date.now();
    await chat.save();

    return res.json({ roadmap: reply, chatId: chat._id });
  } catch (err) {
    console.error("premium/roadmap error:", err.response?.data || err.message);
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ error: err.response?.data?.error || err.message || "Failed to generate roadmap" });
  }
});

// GET /premium/conversations - list user's conversations (brief)
router.get("/conversations", userAuth, requirePremium, async (req, res) => {
  try {
    const convos = await AIChat.find({ user: req.user._id }).select("title updatedAt messages").sort({ updatedAt: -1 }).lean();

    const list = convos.map((c) => ({
      _id: c._id,
      title: c.title || "AI Conversation",
      updatedAt: c.updatedAt,
      lastMessage: c.messages?.length ? c.messages[c.messages.length - 1] : null,
    }));

    return res.json({ conversations: list });
  } catch (err) {
    console.error("conversations list error:", err);
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// GET /premium/conversations/:id - fetch conversation messages
router.get("/conversations/:id", userAuth, requirePremium, async (req, res) => {
  try {
    const chat = await AIChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Conversation not found" });
    if (chat.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    return res.json({ chat });
  } catch (err) {
    console.error("conversation fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch conversation" });
  }
});

// POST /premium/conversations/:id/message - append a message manually
router.post("/conversations/:id/message", userAuth, requirePremium, async (req, res) => {
  try {
    const { role, text } = req.body;
    if (!role || !text) return res.status(400).json({ message: "role and text required" });

    const chat = await AIChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Conversation not found" });
    if (chat.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    chat.messages.push({ role, text });
    chat.updatedAt = Date.now();
    await chat.save();

    return res.json({ chat });
  } catch (err) {
    console.error("append message error:", err);
    return res.status(500).json({ error: "Failed to append message" });
  }
});

// DELETE /premium/conversations/:id - delete a conversation
router.delete("/conversations/:id", userAuth, requirePremium, async (req, res) => {
  try {
    const chat = await AIChat.findById(req.params.id);
    if (!chat) return res.status(404).json({ message: "Conversation not found" });
    if (chat.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Forbidden" });

    await AIChat.deleteOne({ _id: chat._id });
    return res.json({ message: "Conversation deleted" });
  } catch (err) {
    console.error("delete conversation error:", err);
    return res.status(500).json({ error: "Failed to delete conversation" });
  }
});

module.exports = router;
