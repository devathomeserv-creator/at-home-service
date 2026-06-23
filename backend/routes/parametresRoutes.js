const express = require('express')
const router = express.Router()
const { getModeMaintenance, modifierModeMaintenance } = require('../controllers/parametresController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/maintenance', getModeMaintenance)
router.put('/maintenance', verifierToken, verifierRole('admin'), modifierModeMaintenance)

module.exports = router