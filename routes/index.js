// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { isAuthenticated } = require('../middleware/auth'); // Importar el middleware

router.get('/', isAuthenticated, indexController.getHomePage);

module.exports = router;