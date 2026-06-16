const express = require('express')
const router = express.Router()
const { getProfilPublic } = require('../controllers/profilPublicController')

router.get('/:id', getProfilPublic)

module.exports = router