const express = require('express')
const router = express.Router()
const { getMonParrainage } = require('../controllers/parrainageController')
const { verifierToken } = require('../middleware/authMiddleware')

router.get('/', verifierToken, getMonParrainage)

module.exports = router