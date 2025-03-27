// controllers/notasDeCreditoController.js
const Facturas = require('../models/Facturas');

const getCreditNotes = async (req, res) => {
    try {
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Parámetros de filtrado
        const folio = req.query.folio;
        const year = req.query.year;
        const month = req.query.month;

        // Construir query de filtrado
        let query = { tipoDTENumber: 61 };

        if (folio) {
            query.folio = parseInt(folio);
        }

        if (year) {
            query.fechaEmision = {
                $gte: new Date(`${year}-01-01`),
                $lt: new Date(`${parseInt(year) + 1}-01-01`)
            };
        }

        if (month) {
            const startDate = new Date(year || new Date().getFullYear(), parseInt(month) - 1, 1);
            const endDate = new Date(year || new Date().getFullYear(), parseInt(month), 1);
            query.fechaEmision = {
                ...query.fechaEmision,
                $gte: startDate,
                $lt: endDate
            };
        }

        // Obtener total de documentos para la paginación
        const total = await Facturas.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Obtener notas de crédito con paginación y filtros
        const notasDeCredito = await Facturas.find(query)
            .sort({ fechaEmision: -1 })
            .skip(skip)
            .limit(limit);

        res.render('notasDeCredito', {
            notasDeCredito,
            pagination: {
                page,
                totalPages,
                limit,
                total
            },
            filters: {
                folio,
                year,
                month
            },
            error: null
        });
    } catch (error) {
        console.error('❌ Error en getCreditNotes:', error.message);
        res.status(500).render('notasDeCredito', {
            notasDeCredito: [],
            pagination: {
                page: 1,
                totalPages: 1,
                limit: 10,
                total: 0
            },
            filters: {
                folio: null,
                year: null,
                month: null
            },
            error: 'Error al obtener notas de crédito'
        });
    }
};

module.exports = { getCreditNotes };