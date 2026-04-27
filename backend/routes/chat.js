const express = require("express");
const router = express.Router();
const { processChatMessage } = require("../services/chatService");


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



module.exports = router;
