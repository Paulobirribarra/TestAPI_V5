const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Solo importar, no redefinir

router.get('/consulta', isAuthenticated, apiController.getInvoices);
router.get('/actualizar-facturas-pagadas', isAuthenticated, apiController.updatePaidInvoices);
router.post('/config', isAuthenticated, isAdmin, apiController.saveConfig);

module.exports = router;