const express = require('express');
const router = express.Router();
const scriptController = require('../controllers/scriptController');
const { authMiddleware, requireCredits } = require('../middleware/authMiddleware');

router.post('/generate', authMiddleware, requireCredits(1), scriptController.generateScript);
router.post('/story', authMiddleware, requireCredits(1), scriptController.generate4PartScript);

module.exports = router;
