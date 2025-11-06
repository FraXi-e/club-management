const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbot.controller');

// Start a new conversation
router.post('/start', chatbotController.startConversation);

// Send a message in existing conversation
router.post('/message', chatbotController.sendMessage);

// Get conversation history
router.get('/conversation/:id', chatbotController.getConversation);

// Generate final health assessment
router.post('/assessment', chatbotController.generateAssessment);

// List all conversations
router.get('/conversations', chatbotController.listConversations);

module.exports = router;
