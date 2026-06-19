const express = require('express')
const router = express.Router()
const { creerService, obtenirServices, obtenirMonService, modifierService, supprimerService } = require('../controllers/servicesController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/', obtenirServices)
router.get('/mes-services', verifierToken, verifierRole('prestataire'), obtenirMonService)
router.post('/', verifierToken, verifierRole('prestataire'), creerService)
router.put('/:id', verifierToken, verifierRole('prestataire'), modifierService)
router.delete('/:id', verifierToken, verifierRole('prestataire'), supprimerService)

module.exports = router