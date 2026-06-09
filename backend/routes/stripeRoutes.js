const express = require('express')
const router = express.Router()
const { creerPaiement } = require('../controllers/stripeController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/paiement', verifierToken, verifierRole('client'), creerPaiement)

module.exports = router