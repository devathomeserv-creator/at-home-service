const express = require('express')
const router = express.Router()
const { getPrestatairesCarte } = require('../controllers/carteController')

router.get('/', getPrestatairesCarte)

module.exports = router