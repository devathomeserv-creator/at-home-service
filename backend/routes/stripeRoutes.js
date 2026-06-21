const express = require('express')
const router = express.Router()
const { creerPaiement, recupererPaiementIntent } = require('../controllers/stripeController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/paiement', verifierToken, verifierRole('client'), creerPaiement)
router.get('/session/:session_id', verifierToken, recupererPaiementIntent)

module.exports = router