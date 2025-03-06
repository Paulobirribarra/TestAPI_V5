// services/invoiceService.js
const Facturas = require('../models/Facturas');

const saveInvoices = async (facturas) => {
    if (!facturas || facturas.length === 0) {
        console.log('⚠️ No hay facturas para guardar.');
        return;
    }

    try {
        // Obtener folios y tipos de DTE existentes en la base de datos
        const existingFolios = await Facturas.find({
            folio: { $in: facturas.map(f => f.folio) },
            tipoDTENumber: { $in: facturas.map(f => f.tipoDTENumber) }
        }, { folio: 1, tipoDTENumber: 1 });

        // Crear un mapa de folios y tipos de DTE existentes
        const existingMap = new Map();
        existingFolios.forEach(f => {
            existingMap.set(`${f.folio}-${f.tipoDTENumber}`, true);
        });

        // Filtrar facturas que no existen aún
        const newFacturas = facturas.filter(f => !existingMap.has(`${f.folio}-${f.tipoDTENumber}`));

        if (newFacturas.length === 0) {
            console.log('ℹ️ Todas las facturas ya existen en la base de datos.');
            return;
        }

        // Guardar solo las facturas nuevas
        await Facturas.insertMany(newFacturas);
        console.log(`💾 Facturas guardadas: ${newFacturas.length} (de un total de ${facturas.length})`);
    } catch (error) {
        console.error('❌ Error al guardar facturas:', error.message);
        throw error;
    }
};

const updatePaidInvoices = async () => {
    const facturas = await Facturas.find({ tipoDocReferencia: 48, pagada: false });
    for (const factura of facturas) {
        await Facturas.updateOne(
            { _id: factura._id },
            {
                pagada: true,
                estado: 'Pagada',
                metodoDePago: 'contado',
                pagadaAutomaticamente: true,
                numeroDeOperacion: factura.folioDocReferencia,
            }
        );
    }
    return facturas.length;
};

module.exports = { saveInvoices, updatePaidInvoices };