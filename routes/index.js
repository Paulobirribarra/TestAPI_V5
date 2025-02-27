const express = require('express');
const router = express.Router();
const Facturas = require('../models/Facturas');

// Ruta PRINCIPAL con paginación
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 24;
        const skip = (page - 1) * limit;

        console.log(`📋 Página: ${page}, Limit: ${limit}, Skip: ${skip}`);

        // Obtener folios de notas de crédito (tipoDte: 61)
        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 }, { folioDocReferencia: 1 });
        const foliosAnulados = notasDeCredito.map(nc => nc.folioDocReferencia).filter(folio => folio !== "");

        console.log(`📋 Folios anulados por notas de crédito: ${foliosAnulados.length}`, foliosAnulados);

        // Consultar facturas válidas (tipoDte: 33, no anuladas)
        const facturas = await Facturas.find({
            tipoDTENumber: 33,
            folio: { $nin: foliosAnulados } // Excluir facturas cuyos folios estén en notas de crédito
        })
            .skip(skip)
            .limit(limit);
        console.log(`📋 Facturas válidas encontradas: ${facturas.length}`);

        // Contar el total de facturas válidas
        const totalFacturas = await Facturas.countDocuments({
            tipoDTENumber: 33,
            folio: { $nin: foliosAnulados }
        });
        const totalPages = Math.ceil(totalFacturas / limit);
        console.log(`📋 Total facturas válidas: ${totalFacturas}, Total páginas: ${totalPages}`);

        res.render('index', {
            facturas,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages
        });
    } catch (error) {
        console.error("❌ Error al obtener las facturas:", error.message);
        res.status(500).json({ error: "Error al obtener las facturas" });
    }
});

module.exports = router;