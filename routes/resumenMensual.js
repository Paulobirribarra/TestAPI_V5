// routes/resumenMensual.js
const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const resumenMensualController = require('../controllers/resumenMensualController'); // Importamos el controlador

// Definimos la ruta usando el controlador
router.get('/', isAuthenticated, resumenMensualController.getResumenMensual);

module.exports = router;