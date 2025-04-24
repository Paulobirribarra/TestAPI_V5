// services/invoiceService.js
const Facturas = require('../models/Facturas');
const ResumenMensual = require('../models/ResumenMensual');

const saveInvoices = async (facturas) => {
    if (!facturas || facturas.length === 0) {
        console.log('⚠️ No hay facturas para guardar.');
        return { saved: false, message: 'No hay facturas para guardar.', savedCount: 0, updatedCount: 0 };
    }

    try {
        // Obtener las facturas existentes en la base de datos
        const existingFolios = await Facturas.find({
            folio: { $in: facturas.map(f => f.folio) },
            tipoDTENumber: { $in: facturas.map(f => f.tipoDTENumber) }
        }, { folio: 1, tipoDTENumber: 1, modificadoPor: 1 });

        const existingMap = new Map();
        const existingDataMap = new Map();
        existingFolios.forEach(f => {
            const key = `${f.folio}-${f.tipoDTENumber}`;
            existingMap.set(key, true);
            existingDataMap.set(key, f); // Guardar datos existentes para preservar ciertos campos
        });

        let savedCount = 0;
        let updatedCount = 0;

        // Separar facturas nuevas y facturas a actualizar
        const newFacturas = [];
        const facturasToUpdate = [];

        for (const factura of facturas) {
            const key = `${factura.folio}-${factura.tipoDTENumber}`;
            if (existingMap.has(key)) {
                // Factura existente: preparar para actualización
                const existingFactura = existingDataMap.get(key);
                facturasToUpdate.push({
                    ...factura,
                    modificadoPor: existingFactura.modificadoPor || factura.modificadoPor || null, // Preservar modificadoPor
                    fechaModificacion: new Date()
                });
            } else {
                // Factura nueva: preparar para inserción
                newFacturas.push({
                    ...factura,
                    fechaModificacion: new Date()
                });
            }
        }

        // Insertar facturas nuevas
        if (newFacturas.length > 0) {
            await Facturas.insertMany(newFacturas);
            savedCount = newFacturas.length;
            console.log(`💾 Facturas nuevas guardadas: ${savedCount}`);
        }

        // Actualizar facturas existentes
        if (facturasToUpdate.length > 0) {
            for (const factura of facturasToUpdate) {
                await Facturas.updateOne(
                    { folio: factura.folio, tipoDTENumber: factura.tipoDTENumber },
                    {
                        $set: {
                            razonSocial: factura.razonSocial,
                            rutCliente: factura.rutCliente,
                            tipoDTENumber: factura.tipoDTENumber,
                            tipoDTEString: factura.tipoDTEString,
                            folioDocReferencia: factura.folioDocReferencia || '',
                            fechaEmision: factura.fechaEmision,
                            estado: factura.estado,
                            montoNeto: factura.montoNeto,
                            montoIVA: factura.montoIVA,
                            montoTotal: factura.montoTotal,
                            montoIVARecuperable: factura.montoIVARecuperable || 0,
                            idInterno: factura.idInterno || '',
                            dia: factura.dia,
                            mes: factura.mes,
                            anio: factura.anio,
                            pagada: factura.pagada || false,
                            metodoDePago: factura.metodoDePago || '',
                            comentario: factura.comentario || '',
                            numeroDeOperacion: factura.numeroDeOperacion || '',
                            tipoDocReferencia: factura.tipoDocReferencia || 0,
                            fechaVencimiento: factura.fechaVencimiento || null,
                            contacto: factura.contacto || '',
                            correoContacto: factura.correoContacto || '',
                            sector: factura.sector || '',
                            tipoVenta: factura.tipoVenta || '',
                            fechaRecepcion: factura.fechaRecepcion || null,
                            montoExento: factura.montoExento || 0,
                            codigoOtroImpuesto: factura.codigoOtroImpuesto || 0,
                            totalOtrosImpuestos: factura.totalOtrosImpuestos || 0,
                            ivaRetenidoTotal: factura.ivaRetenidoTotal || 0,
                            ivaRetenidoParcial: factura.ivaRetenidoParcial || 0,
                            ivaNoRetenido: factura.ivaNoRetenido || 0,
                            ivaPropio: factura.ivaPropio || 0,
                            ivaTerceros: factura.ivaTerceros || 0,
                            rutEmisorLiqFactura: factura.rutEmisorLiqFactura || '-',
                            netoComisionLiqFactura: factura.netoComisionLiqFactura || 0,
                            exentoComisionLiqFactura: factura.exentoComisionLiqFactura || 0,
                            ivaComisionLiqFactura: factura.ivaComisionLiqFactura || 0,
                            ivaFueraPlazo: factura.ivaFueraPlazo || 0,
                            creditoEmpresaConstructora: factura.creditoEmpresaConstructora || 0,
                            garantiaDepEnvases: factura.garantiaDepEnvases || 0,
                            numeroInterno: factura.numeroInterno || '',
                            nceNdeFacturaCompra: factura.nceNdeFacturaCompra || '',
                            montoNoFacturable: factura.montoNoFacturable || 0,
                            indicadorVentaSinCosto: factura.indicadorVentaSinCosto || 0,
                            indicadorServicioPeriodico: factura.indicadorServicioPeriodico || 0,
                            periodo: factura.periodo,
                            fechaModificacion: factura.fechaModificacion,
                            modificadoPor: factura.modificadoPor
                        }
                    }
                );
                updatedCount++;
                console.log(`📝 Factura con folio ${factura.folio} actualizada`);
            }
        }

        console.log(`💾 Total facturas procesadas: ${facturas.length}, nuevas: ${savedCount}, actualizadas: ${updatedCount}`);
        return {
            saved: savedCount > 0 || updatedCount > 0,
            message: `Facturas procesadas: ${facturas.length}, nuevas: ${savedCount}, actualizadas: ${updatedCount}`,
            savedCount,
            updatedCount
        };
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