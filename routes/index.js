// routes/index.js
const express = require('express');
const router = express.Router();
const Facturas = require('../models/Facturas');

// Ruta PRINCIPAL
router.get('/', async (req, res) => {
    try {
        // Consultamos las facturas de la base de datos Mongo local
        const facturas = await Facturas.find();
        
        // Filtramos las facturas que no tienen un folioDocReferencia (es decir, no son notas de crédito)
        const facturasValidas = facturas.filter(factura => !factura.folioDocReferencia);
        
        // Renderizamos la vista index.ejs pasando las facturas válidas
        res.render('index', { facturas: facturasValidas });
    } catch (error) {
        console.log("Error al obtener las facturas de la base local", error.message);
        res.status(500).json({ error: "Error al obtener las facturas" });
    }
});

module.exports = router;
