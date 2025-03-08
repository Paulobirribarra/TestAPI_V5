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

const updateResumenMensual = async (periodo, documentos) => {
    try {
        if (!Array.isArray(documentos)) {
            console.error(`❌ Error: 'documentos' no es un array válido, recibido: ${documentos}`);
            throw new Error("El parámetro 'documentos' debe ser un array");
        }

        console.log(`🔄 Actualizando ResumenMensual para el periodo: ${periodo} con ${documentos.length} documentos`);

        let totalFacturas = 0;
        let totalNotasCredito = 0;

        documentos.forEach(doc => {
            const montoTotalDoc = Number(doc.montoTotal) || 0;
            if (doc.tipoDTENumber === 33) { // Facturas electrónicas
                totalFacturas += montoTotalDoc;
            } else if (doc.tipoDTENumber === 61) { // Notas de crédito
                totalNotasCredito += montoTotalDoc;
            }
        });

        const montoNeto = totalFacturas - totalNotasCredito;

        console.log(`📊 Calculados: totalFacturas=${totalFacturas}, totalNotasCredito=${totalNotasCredito}, montoNeto=${montoNeto}`);

        const result = await ResumenMensual.updateOne(
            { periodo },
            {
                $set: {
                    totalFacturas,
                    totalNotasCredito,
                    montoNeto,
                    fechaActualizacion: new Date()
                }
            },
            { upsert: true }
        );

        console.log(`📊 Resultado de la actualización de ResumenMensual:`, result);
        if (result.matchedCount === 0 && result.upsertedCount === 1) {
            console.log(`✅ Nuevo periodo ${periodo} creado en ResumenMensual`);
        } else if (result.modifiedCount > 0) {
            console.log(`✅ Periodo ${periodo} actualizado en ResumenMensual`);
        } else {
            console.log(`ℹ️ No se hicieron cambios en ResumenMensual para el periodo ${periodo}`);
        }
    } catch (error) {
        console.error('❌ Error al actualizar ResumenMensual:', error.message);
        throw error;
    }
};

module.exports = { saveInvoices, updateResumenMensual };