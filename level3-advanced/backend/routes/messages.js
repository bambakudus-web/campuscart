const express = require('express');
const router = express.Router();
const { getConversations, getConversationHistory } = require('../controllers/messagesController');
const { requireAuth } = require('../middleware/auth');

router.get('/conversations', requireAuth, getConversations);
router.get('/:listingId/:buyerId', requireAuth, getConversationHistory);

module.exports = router;
