const express = require('express');
const router = express.Router();
const facturasController = require('../controllers/facturasController');

// Rutas para agregar facturas
router.get('/add', facturasController.showAddFactura);
router.post('/add', facturasController.addFactura);

module.exports = router; 