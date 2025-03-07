// routes/config.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, configController.getConfigPage);
router.post('/sii', isAuthenticated, isAdmin, configController.saveSiiConfig);

module.exports = router;