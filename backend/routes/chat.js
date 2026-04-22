const express = require("express");
const router = express.Router();
const { processChatMessage } = require("../services/chatService");
const ChatSession = require("../models/ChatSession");

/**
 * @desc    Main chat endpoint
 * @route   POST /api/chat
 * @access  Public (Guest support) / Private (Logged in support)
 */
router.post("/", async (req, res) => {
  try {
    const { message, userId, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Please provide a message" });
    }

    // Process chat via AI service (tool calling handles filter extraction)
    const { reply, listings, filters } = await processChatMessage(message, conversationHistory);

    res.status(200).json({
      success: true,
      reply,
      listings,
      filters
    });
  } catch (error) {
    if (error.message === "RATE_LIMIT_ERROR") {
      return res.status(429).json({
        success: false,
        message: "Too many requests. Please try again in a moment!"
      });
    }
    console.error("Chat Route Error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again shortly!"
    });
  }
});

/**
 * @desc    Delete specific messages from a chat session
 * @route   DELETE /api/chat/messages
 */
router.delete("/messages", async (req, res) => {
  try {
    const { userId, messageIds } = req.body;
    if (!userId || !messageIds || !Array.isArray(messageIds)) {
      return res.status(400).json({ success: false, message: "Invalid request data" });
    }

    const session = await ChatSession.findOne({ userId });
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // Filter out messages that match the IDs
    session.messages = session.messages.filter(msg => !messageIds.includes(msg.id));
    session.messageCount = session.messages.length;
    
    await session.save();

    res.status(200).json({ success: true, message: "Messages deleted successfully" });
  } catch (error) {
    console.error("Delete Messages Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete messages" });
  }
});

/**
 * @desc    Save a chat message pair (non-blocking)
 * @route   POST /api/chat/save
 */
router.post("/save", async (req, res) => {
  try {
    const { userId, sessionId, messagePair } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });

    let session = await ChatSession.findOne({ userId, sessionId });

    if (!session) {
      session = new ChatSession({
        userId,
        sessionId,
        messages: [],
      });
    }

    session.messages.push(...messagePair);
    session.messageCount = session.messages.length;
    
    // Update last filters/city if any
    const assistantMsg = messagePair.find(m => m.role === 'assistant');
    if (assistantMsg && assistantMsg.filters) {
      session.lastFilters = assistantMsg.filters;
      if (assistantMsg.filters.city) session.lastCity = assistantMsg.filters.city;
    }

    await session.save();

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Save Chat Error:", error);
    res.status(500).json({ success: false });
  }
});

/**
 * @desc    Get chat history
 * @route   GET /api/chat/history/:userId
 */
router.get("/history/:userId", async (req, res) => {
  try {
    const session = await ChatSession.findOne({ userId: req.params.userId }).sort({ updatedAt: -1 });
    
    if (!session) {
      return res.status(200).json({ success: true, history: [] });
    }

    res.status(200).json({
      success: true,
      history: session.messages,
      lastFilters: session.lastFilters
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({ success: false });
  }
});

/**
 * @desc    Clear chat history
 * @route   DELETE /api/chat/history/:userId
 */
router.delete("/history/:userId", async (req, res) => {
  try {
    await ChatSession.deleteMany({ userId: req.params.userId });
    res.status(200).json({ success: true, message: "Chat history cleared" });
  } catch (error) {
    console.error("Clear History Error:", error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
