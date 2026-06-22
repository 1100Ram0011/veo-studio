const express = require('express')
const router = express.Router()
const reelsController = require('../controllers/reelsController')
const { authMiddleware, requireCredits } = require('../middleware/authMiddleware')

router.post('/generate', authMiddleware, requireCredits(1), reelsController.generateReels)
router.post('/result', reelsController.getReelsResult)

module.exports = router
