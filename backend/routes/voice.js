const express = require('express')
const router = express.Router()
const voiceController = require('../controllers/voiceController')
const { authMiddleware, requireCredits } = require('../middleware/authMiddleware')

router.post('/generate', authMiddleware, requireCredits(1), voiceController.generateVoice)

module.exports = router
