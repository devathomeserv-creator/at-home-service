const express = require('express')
const router = express.Router()
const { getTopPrestataires } = require('../controllers/topPrestataireController')

router.get('/', getTopPrestataires)

module.exports = router