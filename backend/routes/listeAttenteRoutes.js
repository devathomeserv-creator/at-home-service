const express = require('express')
const router = express.Router()
const { ajouterListeAttente, getMaListeAttente, retirerListeAttente } = require('../controllers/listeAttenteController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('client'), ajouterListeAttente)
router.get('/', verifierToken, verifierRole('client'), getMaListeAttente)
router.delete('/:id', verifierToken, verifierRole('client'), retirerListeAttente)

module.exports = router