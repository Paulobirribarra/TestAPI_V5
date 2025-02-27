// routes/notasDeCredito.js
const express = require('express');
const router = express.Router();
const Facturas = require('../models/Facturas');

// Ruta para mostrar las Notas de Crédito
router.get('/', async (req, res) => {
    try {
        // Consultamos solo las notas de crédito (tipoDTENumber: 61)
        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 });
        console.log(`📋 Notas de crédito encontradas: ${notasDeCredito.length}`);

        // Renderizamos la vista
        res.render('notasDeCredito', { notasDeCredito });
    } catch (error) {
        console.error("❌ Error al obtener las notas de crédito:", error.message);
        res.status(500).json({ error: "Error al obtener las notas de crédito" });
    }
});

module.exports = router;
