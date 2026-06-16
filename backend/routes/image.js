const express = require('express')
const router = express.Router()
const imageController = require('../controllers/imageController')

// Yahan imageController.generateImage likhna compulsory hai
router.post('/generate', imageController.generateImage)

module.exports = router