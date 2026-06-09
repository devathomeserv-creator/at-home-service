const express = require('express')
const router = express.Router()
const { creerService, obtenirServices, obtenirMonService, modifierService } = require('../controllers/servicesController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/', obtenirServices)
router.get('/mes-services', verifierToken, verifierRole('prestataire'), obtenirMonService)
router.post('/', verifierToken, verifierRole('prestataire'), creerService)
router.put('/:id', verifierToken, verifierRole('prestataire'), modifierService)

module.exports = router