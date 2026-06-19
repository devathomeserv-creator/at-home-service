const express = require('express')
const router = express.Router()
const { getPrestatairesListe } = require('../controllers/prestatairesController')

router.get('/', getPrestatairesListe)

module.exports = router