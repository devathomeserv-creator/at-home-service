const express = require('express')
const router = express.Router()
const { creerReservation, mesReservationsClient, mesReservationsPrestataire, modifierStatut } = require('../controllers/bookingsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('client'), creerReservation)
router.get('/client', verifierToken, verifierRole('client'), mesReservationsClient)
router.get('/prestataire', verifierToken, verifierRole('prestataire'), mesReservationsPrestataire)
router.put('/:id/statut', verifierToken, verifierRole('prestataire', 'admin'), modifierStatut)

module.exports = router