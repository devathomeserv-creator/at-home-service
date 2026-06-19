const express = require('express')
const router = express.Router()
const { ajouterFavori, retirerFavori, getMesFavoris, verifierFavori } = require('../controllers/favorisController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('client'), ajouterFavori)
router.delete('/:prestataire_id', verifierToken, verifierRole('client'), retirerFavori)
router.get('/', verifierToken, verifierRole('client'), getMesFavoris)
router.get('/verifier/:prestataire_id', verifierToken, verifierRole('client'), verifierFavori)

module.exports = router