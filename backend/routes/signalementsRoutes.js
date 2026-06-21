const express = require('express')
const router = express.Router()
const { creerSignalement, getSignalements, modifierStatutSignalement } = require('../controllers/signalementsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.post('/', verifierToken, verifierRole('client'), creerSignalement)
router.get('/', verifierToken, verifierRole('admin'), getSignalements)
router.put('/:id/statut', verifierToken, verifierRole('admin'), modifierStatutSignalement)

module.exports = router