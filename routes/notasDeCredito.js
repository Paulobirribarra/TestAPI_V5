// routes/notasDeCredito.js
const express = require('express');
const router = express.Router();
const notasDeCreditoController = require('../controllers/notasDeCreditoController');

router.get('/', notasDeCreditoController.getCreditNotes);

module.exports = router;