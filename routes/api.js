// routes/api.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');

router.get('/consulta', apiController.getInvoices);
router.get('/actualizar-facturas-pagadas', apiController.updatePaidInvoices);
router.post('/config', apiController.saveConfig);



module.exports = router;