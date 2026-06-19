const express = require('express')
const router = express.Router()
const { getStatsPrestataire } = require('../controllers/statsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/prestataire', verifierToken, verifierRole('prestataire'), getStatsPrestataire)

module.exports = router