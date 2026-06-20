const express = require('express');
const router = express.Router();
const { generateScript } = require('../controllers/scriptController');

router.post('/generate', generateScript);

module.exports = router;
