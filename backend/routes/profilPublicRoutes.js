const express = require('express')
const router = express.Router()
const { getProfilPublic, getCreneauxOccupes } = require('../controllers/profilPublicController')

router.get('/:id', getProfilPublic)
router.get('/:prestataire_id/creneaux-occupes', getCreneauxOccupes)

module.exports = router