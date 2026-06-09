const express = require('express')
const router = express.Router()
const { getUsers, getReservations, supprimerUser } = require('../controllers/adminController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/users', verifierToken, verifierRole('admin'), getUsers)
router.get('/reservations', verifierToken, verifierRole('admin'), getReservations)
router.delete('/users/:id', verifierToken, verifierRole('admin'), supprimerUser)

module.exports = router