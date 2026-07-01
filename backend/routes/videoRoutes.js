const express = require('express')
const router = express.Router()
const { creerSalleVideo } = require('../controllers/videoController')
const { verifierToken } = require('../middleware/authMiddleware')

router.post('/room/:booking_id', verifierToken, creerSalleVideo)

module.exports = router