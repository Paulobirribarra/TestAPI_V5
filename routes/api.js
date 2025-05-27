const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const compraController = require('../controllers/compraController');

const checkPasswordSII = (req, res, next) => {
  if (!req.session.passwordSII || req.session.passwordSIIExpires <= Date.now()) {
    return res.redirect('/consulta');
  }
  next();
};

// Rutas de API
router.get('/consulta', isAuthenticated, isAdmin, checkPasswordSII, apiController.getInvoices);
router.get('/actualizar-facturas-pagadas', isAuthenticated, apiController.updatePaidInvoices);
router.post('/config', isAuthenticated, isAdmin, apiController.saveConfig);
router.get('/consultar-compras', isAuthenticated, isAdmin, checkPasswordSII, compraController.getComprasApi);

module.exports = router; 