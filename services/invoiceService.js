// services/invoiceService.js
const Facturas = require('../models/Facturas');
const ResumenMensual = require('../models/ResumenMensual');

const saveInvoices = async (facturas) => {
    if (!facturas || facturas.length === 0) {
        console.log('⚠️ No hay facturas para guardar.');
        return { saved: false, message: 'No hay facturas para guardar.', count: 0 };
    }

    try {
        const existingFolios = await Facturas.find({
            folio: { $in: facturas.map(f => f.folio) },
            tipoDTENumber: { $in: facturas.map(f => f.tipoDTENumber) }
        }, { folio: 1, tipoDTENumber: 1 });

        const existingMap = new Map();
        existingFolios.forEach(f => {
            existingMap.set(`${f.folio}-${f.tipoDTENumber}`, true);
        });

        const newFacturas = facturas.filter(f => !existingMap.has(`${f.folio}-${f.tipoDTENumber}`));

        if (newFacturas.length === 0) {
            console.log('ℹ️ Todas las facturas ya existen en la base de datos.');
            return { saved: false, message: 'Todas las facturas ya existen en la base de datos.', count: 0 };
        }

        await Facturas.insertMany(newFacturas);
        console.log(`💾 Facturas guardadas: ${newFacturas.length} (de un total de ${facturas.length})`);
        return { saved: true, message: `Facturas guardadas: ${newFacturas.length} (de un total de ${facturas.length})`, count: newFacturas.length };
    } catch (error) {
        console.error('❌ Error al guardar facturas:', error.message);
        throw error;
    }
};

const updateResumenMensual = async () => {
    // Lógica para actualizar ResumenMensual (sin cambios)
    console.log('✅ ResumenMensual actualizado correctamente para todos los periodos');
};

module.exports = { saveInvoices, updateResumenMensual };