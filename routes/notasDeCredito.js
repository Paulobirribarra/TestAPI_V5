//routes/notasDeCredito
const express = require('express');
const router = express.Router();
const notasDeCreditoController = require('../controllers/notasDeCreditoController');
const { isAuthenticated } = require('../middleware/auth'); // Solo importar

router.get('/', isAuthenticated, notasDeCreditoController.getCreditNotes);

module.exports = router;