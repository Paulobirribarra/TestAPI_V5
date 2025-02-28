// controllers/indexController.js
const Facturas = require('../models/Facturas');

const getHomePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 24;
        const skip = (page - 1) * limit;

        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 }, { folioDocReferencia: 1 });
        const foliosAnulados = notasDeCredito.map(nc => nc.folioDocReferencia).filter(Boolean);

        const facturas = await Facturas.find({
            tipoDTENumber: 33,
            folio: { $nin: foliosAnulados },
        })
            .skip(skip)
            .limit(limit);

        const totalFacturas = await Facturas.countDocuments({
            tipoDTENumber: 33,
            folio: { $nin: foliosAnulados },
        });
        const totalPages = Math.ceil(totalFacturas / limit);

        res.render('index', {
            facturas,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
        });
    } catch (error) {
        console.error('❌ Error en getHomePage:', error.message);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

module.exports = { getHomePage };