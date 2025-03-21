// routes/config.js
const express = require('express');
const router = express.Router();
const { getConfigPage, saveSiiConfig } = require('../controllers/configController');
const { saveConfig } = require('../controllers/apiController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

router.get('/', isAuthenticated, isAdmin, getConfigPage);

router.post('/sii', isAuthenticated, isAdmin, saveSiiConfig);

router.post('/api', isAuthenticated, isAdmin, saveConfig);

module.exports = router;