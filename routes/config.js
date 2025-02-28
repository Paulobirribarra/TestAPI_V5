// routes/config.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

router.get('/', configController.getConfigPage);

module.exports = router;