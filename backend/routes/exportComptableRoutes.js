const express = require('express')
const router = express.Router()
const { genererExportComptable } = require('../controllers/exportComptableController')
const { verifierToken, verifierRole } = require('../middleware/authMiddleware')

router.get('/', verifierToken, verifierRole('admin'), genererExportComptable)

module.exports = router