// controllers/notasDeCreditoController.js
const Facturas = require('../models/Facturas');

const getCreditNotes = async (req, res) => {
    try {
        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 });
        res.render('notasDeCredito', { notasDeCredito });
    } catch (error) {
        console.error('❌ Error en getCreditNotes:', error.message);
        res.status(500).json({ error: 'Error al obtener notas de crédito' });
    }
};

module.exports = { getCreditNotes };