//routes/config.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Solo importar

router.get('/', isAuthenticated, isAdmin, configController.getConfigPage);

module.exports = router;