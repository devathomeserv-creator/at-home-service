const express = require('express')
const router = express.Router()
const { getMesClients } = require('../controllers/clientsController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/', verifierToken, verifierRole('prestataire'), getMesClients)

module.exports = router