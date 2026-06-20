const express = require('express')
const router = express.Router()
const { ajouterRealisation, getMesRealisations, getRealisationsPrestataire, supprimerRealisation } = require('../controllers/realisationsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('prestataire'), ajouterRealisation)
router.get('/mes-realisations', verifierToken, verifierRole('prestataire'), getMesRealisations)
router.get('/prestataire/:prestataire_id', getRealisationsPrestataire)
router.delete('/:id', verifierToken, verifierRole('prestataire'), supprimerRealisation)

module.exports = router