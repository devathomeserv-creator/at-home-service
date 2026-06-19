const express = require('express')
const router = express.Router()
const { verifierSiret } = require('../controllers/verificationController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/siret', verifierToken, verifierRole('prestataire'), verifierSiret)

module.exports = router