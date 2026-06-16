const express = require('express')
const router = express.Router()
const voiceController = require('../controllers/voiceController')

// Yahan voiceController.generateVoice check kijiye, 'generateVoice' undefined nahi hona chahiye
router.post('/generate', voiceController.generateVoice)

module.exports = router