// controllers/apiController.js
const apiService = require('../services/apiService');
const invoiceService = require('../services/invoiceService');
const Config = require('../models/Config');

const getInvoices = async (req, res) => {
    try {
        console.log("🟢 Recibida consulta con parámetros:", req.query);
        const config = await Config.findOne();
        const { fecha, mes, anio } = req.query;

        const facturas = await apiService.fetchInvoices({ fecha, mes, anio }, config);
        const saveResult = await invoiceService.saveInvoices(facturas);

        // Calcular el periodo basado en los parámetros de la consulta
        let periodo;
        if (fecha) {
            const [anioFecha, mesFecha] = fecha.split('-');
            periodo = `${anioFecha}${mesFecha}`;
        } else if (mes && anio) {
            periodo = `${anio}${mes.padStart(2, '0')}`;
        } else {
            throw new Error('Parámetros de consulta inválidos');
        }

        // Actualizar ResumenMensual con el periodo y el conteo de facturas guardadas
        await invoiceService.updateResumenMensual(periodo, saveResult.count);

        res.json({
            consultaRealizada: true,
            facturas,
            saveResult
        });
    } catch (error) {
        console.error('❌ Error en getInvoices:', error.message);
        res.status(500).json({ error: error.message });
    }
};

const updatePaidInvoices = async (req, res) => {
    try {
        const updatedCount = await invoiceService.updatePaidInvoices();
        res.json({ success: true, message: `Facturas actualizadas: ${updatedCount}` });
    } catch (error) {
        console.error('❌ Error en updatePaidInvoices:', error);
        res.status(500).json({ error: 'Error al actualizar las facturas' });
    }
};

const saveConfig = async (req, res) => {
    const { apiUser, apiKey } = req.body;
    try {
        await Config.findOneAndUpdate({}, { apiUser, apiKey }, { upsert: true, new: true });
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error en saveConfig:', error);
        res.status(500).json({ error: 'Error al guardar configuración' });
    }
};

module.exports = { getInvoices, updatePaidInvoices, saveConfig };