const express = require('express')
const router = express.Router()
const { genererFacture } = require('../controllers/factureController')
const { verifierToken } = require('../middleware/authMiddleware')

router.get('/:booking_id', verifierToken, genererFacture)

module.exports = router