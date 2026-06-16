const express = require('express')
const router = express.Router()
const { getProfil, modifierProfil, modifierConfirmationAuto, changerMotDePasse, supprimerCompte } = require('../controllers/profilController')
const { verifierToken } = require('../middleware/authMiddleware')

router.get('/', verifierToken, getProfil)
router.put('/', verifierToken, modifierProfil)
router.put('/confirmation-auto', verifierToken, modifierConfirmationAuto)
router.put('/mot-de-passe', verifierToken, changerMotDePasse)
router.delete('/', verifierToken, supprimerCompte)

module.exports = router