const express = require('express')
const router = express.Router()
const imageController = require('../controllers/imageController')
const { authMiddleware, requireCredits } = require('../middleware/authMiddleware')

// Yahan imageController.generateImage likhna compulsory hai
router.post('/generate', authMiddleware, requireCredits(1), imageController.generateImage)

module.exports = router
