const express = require('express')
const router = express.Router()
const reelsController = require('../controllers/reelsController')

router.post('/generate', reelsController.generateReels)
router.post('/result', reelsController.getReelsResult)

module.exports = router