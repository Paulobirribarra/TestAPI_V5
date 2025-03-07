//api.js
const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

const checkPasswordSII = (req, res, next) => {
    if (!req.session.passwordSII || req.session.passwordSIIExpires <= Date.now()) {
        return res.redirect('/consulta');
    }
    next();
};

router.get('/consulta', isAuthenticated, isAdmin, checkPasswordSII, apiController.getInvoices);
router.get('/actualizar-facturas-pagadas', isAuthenticated, apiController.updatePaidInvoices);
router.post('/config', isAuthenticated, isAdmin, apiController.saveConfig);

module.exports = router;