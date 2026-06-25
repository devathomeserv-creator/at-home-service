const express = require('express')
const router = express.Router()
const { creerPaiement, recupererPaiementIntent, creerPaiementSolde, confirmerPaiementSolde } = require('../controllers/stripeController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/paiement', verifierToken, verifierRole('client'), creerPaiement)
router.get('/session/:session_id', verifierToken, recupererPaiementIntent)
router.post('/solde/:booking_id', verifierToken, verifierRole('prestataire'), creerPaiementSolde)
router.put('/solde/:booking_id/confirmer', verifierToken, confirmerPaiementSolde)

module.exports = router