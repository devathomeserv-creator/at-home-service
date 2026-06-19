const express = require('express')
const router = express.Router()
const { envoyerMessage, getMessages, getMessagesNonLus, getMesConversations } = require('../controllers/messagesController')
const { verifierToken } = require('../middleware/authMiddleware')

router.post('/', verifierToken, envoyerMessage)
router.get('/non-lus', verifierToken, getMessagesNonLus)
router.get('/conversations', verifierToken, getMesConversations)
router.get('/:booking_id', verifierToken, getMessages)

module.exports = router