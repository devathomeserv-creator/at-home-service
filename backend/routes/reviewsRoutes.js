const express = require('express')
const router = express.Router()
const { laisserAvis, getAvisService, getAvisPrestataire } = require('../controllers/reviewsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('client'), laisserAvis)
router.get('/service/:service_id', getAvisService)
router.get('/mes-avis', verifierToken, verifierRole('prestataire'), getAvisPrestataire)

module.exports = router