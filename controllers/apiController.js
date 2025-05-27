// controllers/apiController.js
const apiService = require('../services/apiService');
const invoiceService = require('../services/invoiceService');
const Config = require('../models/Config');
const Facturas = require('../models/Facturas');
const Compra = require('../models/Compra');
const ResumenMensual = require('../models/ResumenMensual');

const apiController = {
    async getInvoices(req, res) {
        try {
            const { tipo, dia, mes, anio } = req.query;
            console.log("🟢 Recibida consulta con parámetros:", req.query);

            if (!req.session.passwordSII || req.session.passwordSIIExpires <= Date.now()) {
                return res.redirect('/consulta');
            }

            let documentos;
            let url;
            
            // Construir la URL según el tipo de documento y consulta
            if (tipo === 'ventas' || tipo === 'compras') {
                if (dia && mes && anio) {
                    url = `https://servicios.simpleapi.cl/api/RCV/${tipo}/${dia}/${mes}/${anio}`;
                } else if (mes && anio) {
                    url = `https://servicios.simpleapi.cl/api/RCV/${tipo}/${mes}/${anio}`;
                } else {
                    throw new Error('Parámetros de consulta inválidos');
                }
            } else if (tipo === 'notas-credito' || tipo === 'notas-debito') {
                if (dia && mes && anio) {
                    url = `https://servicios.simpleapi.cl/api/RCV/${tipo}/${dia}/${mes}/${anio}`;
                } else if (mes && anio) {
                    url = `https://servicios.simpleapi.cl/api/RCV/${tipo}/${mes}/${anio}`;
                } else {
                    throw new Error('Parámetros de consulta inválidos');
                }
            } else {
                throw new Error('Tipo de documento no válido');
            }

            documentos = await apiService.consultarAPI(url, req.session.passwordSII);

            // Guardar documentos en la base de datos
            const Model = tipo === 'ventas' ? Facturas : Compra;
            for (const doc of documentos) {
                const query = tipo === 'ventas' 
                    ? { folio: doc.folio, tipoDTENumber: doc.tipoDTE }
                    : { folio: doc.folio, tipoDocumento: doc.tipoDocumento };
                
                await Model.findOneAndUpdate(
                    query,
                    doc,
                    { upsert: true, new: true }
                );
            }

            res.json({
                consultaRealizada: true,
                documentos: documentos
            });
        } catch (error) {
            console.error('❌ Error al consultar documentos:', error);
            res.status(500).json({
                error: error.message
            });
        }
    },

    async updatePaidInvoices(req, res) {
        try {
            const updatedCount = await invoiceService.updatePaidInvoices();
            res.json({ updatedCount });
        } catch (error) {
            console.error('❌ Error al actualizar facturas:', error);
            res.status(500).json({ error: 'Error al actualizar las facturas' });
        }
    },

    async saveConfig(req, res) {
        const { apiUser, apiKey } = req.body;
        console.log('📥 Datos recibidos en saveConfig:', { apiUser, apiKey });
        try {
            await Config.findOneAndUpdate(
                {},
                { apiUser, apiKey },
                { upsert: true }
            );
            res.json({ success: true });
        } catch (error) {
            console.error('❌ Error en saveConfig:', error);
            res.status(500).json({ error: 'Error al guardar configuración' });
        }
    },

    async consultarAPI(req, res) {
        try {
            const { tipo, fecha, mes, anio, passwordSII } = req.body;
            console.log('🟢 Recibida consulta con parámetros:', { tipo, fecha, mes, anio });
            
            let url = '';
            if (fecha) {
                const [anio, mes, dia] = fecha.split('-');
                url = `${process.env.API_URL}/api/RCV/${tipo}/${dia}/${mes}/${anio}`;
            } else if (mes && anio) {
                url = `${process.env.API_URL}/api/RCV/${tipo}/${mes}/${anio}`;
            } else {
                return res.status(400).json({ error: 'Parámetros de consulta inválidos' });
            }

            console.log('🔗 URL generada:', url);

            const documentos = await apiService.consultarAPI(url, passwordSII);
            console.log('📄 Documentos recibidos:', documentos.length);

            // Guardar documentos según el tipo
            if (tipo === 'ventas') {
                console.log('💾 Guardando facturas...');
                await guardarFacturas(documentos);
            } else if (tipo === 'compras') {
                console.log('💾 Guardando compras...');
                await guardarCompras(documentos);
            }

            // Actualizar resumen mensual
            console.log('🔄 Iniciando actualización del resumen mensual...');
            await actualizarResumenMensual(documentos, tipo);
            console.log('✅ Resumen mensual actualizado');

            res.json(documentos);
        } catch (error) {
            console.error('❌ Error en consultarAPI:', error);
            res.status(500).json({ error: error.message });
        }
    }
};

const guardarCompras = async (compras) => {
    console.log('💾 Iniciando guardado de compras...');
    console.log('💾 Total de compras a guardar:', compras.length);
    
    for (const compra of compras) {
        console.log('💾 Procesando compra:', JSON.stringify(compra, null, 2));
        try {
            const compraGuardada = await Compra.findOneAndUpdate(
                { folio: compra.folio, tipoDocumento: compra.tipoDocumento },
                {
                    tipoDocumento: compra.tipoDocumento,
                    folio: compra.folio,
                    fechaEmision: compra.fechaEmision,
                    rutEmisor: compra.rutEmisor,
                    razonSocialEmisor: compra.razonSocialEmisor,
                    montoExento: compra.montoExento,
                    montoAfecto: compra.montoAfecto,
                    iva: compra.iva,
                    montoTotal: compra.montoTotal,
                    montoNeto: compra.montoNeto,
                    montoIvaRecuperable: compra.montoIvaRecuperable,
                    estado: compra.estado,
                    fechaModificacion: new Date()
                },
                { upsert: true, new: true }
            );
            console.log('✅ Compra guardada:', JSON.stringify(compraGuardada, null, 2));
        } catch (error) {
            console.error('❌ Error al guardar compra:', error);
            throw error;
        }
    }
    console.log('✅ Todas las compras guardadas correctamente');
};

const guardarFacturas = async (facturas) => {
    console.log('💾 Iniciando guardado de facturas...');
    console.log('💾 Total de facturas a guardar:', facturas.length);
    
    for (const factura of facturas) {
        try {
            // Actualizar o crear factura usando findOneAndUpdate con upsert
            const facturaGuardada = await Facturas.findOneAndUpdate(
                { 
                    folio: factura.folio,
                    tipoDTENumber: factura.tipoDTENumber
                },
                {
                    ...factura,
                    fechaModificacion: new Date()
                },
                { 
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true
                }
            );
            console.log(`✅ Factura ${facturaGuardada.folio} procesada correctamente`);
        } catch (error) {
            console.error('❌ Error al guardar factura:', error);
            throw error;
        }
    }
    console.log('✅ Todas las facturas procesadas correctamente');
};

const actualizarResumenMensual = async (documentos, tipo) => {
    console.log('📊 Iniciando actualización del resumen mensual...');
    console.log('📊 Tipo de documento:', tipo);

    if (!documentos || documentos.length === 0) {
        console.log('⚠️ No hay documentos para procesar');
        return;
    }

    // Agrupar documentos por periodo (YYYYMM)
    const documentosPorPeriodo = documentos.reduce((acc, doc) => {
        if (!doc.fechaEmision) {
            return acc;
        }

        const fecha = new Date(doc.fechaEmision);
        if (isNaN(fecha.getTime())) {
            return acc;
        }

        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const periodo = `${anio}${mes}`;
        
        if (!acc[periodo]) {
            acc[periodo] = [];
        }
        acc[periodo].push(doc);
        return acc;
    }, {});

    // Actualizar cada periodo
    for (const [periodo, docs] of Object.entries(documentosPorPeriodo)) {
        console.log(`📊 Procesando periodo ${periodo} con ${docs.length} documentos`);

        // Calcular totales para el periodo
        const totales = docs.reduce((acc, doc) => {
            if (tipo === 'compras') {
                acc.total += Number(doc.montoTotal) || 0;
                acc.neto += Number(doc.montoNeto) || 0;
                acc.ivaRecuperable += Number(doc.montoIvaRecuperable) || 0;
            } else {
                acc.total += Number(doc.montoTotal) || 0;
                acc.neto += Number(doc.montoNeto) || 0;
                acc.iva += Number(doc.montoIVA) || 0;
            }
            return acc;
        }, tipo === 'compras' 
            ? { total: 0, neto: 0, ivaRecuperable: 0 }
            : { total: 0, neto: 0, iva: 0 }
        );

        try {
            // Buscar el resumen existente
            const resumenExistente = await ResumenMensual.findOne({ periodo });

            if (resumenExistente) {
                // Actualizar el resumen existente
                if (tipo === 'compras') {
                    resumenExistente.compras = {
                        total: totales.total,
                        neto: totales.neto,
                        ivaRecuperable: totales.ivaRecuperable
                    };
                } else {
                    resumenExistente.ventas = {
                        total: totales.total,
                        neto: totales.neto,
                        iva: totales.iva
                    };
                }
                resumenExistente.fechaActualizacion = new Date();
                await resumenExistente.save();
                console.log(`✅ Resumen actualizado para periodo ${periodo}`);
            } else {
                // Crear nuevo resumen
                const nuevoResumen = new ResumenMensual({
                    periodo,
                    ventas: tipo === 'ventas' ? {
                        total: totales.total,
                        neto: totales.neto,
                        iva: totales.iva
                    } : {
                        total: 0,
                        neto: 0,
                        iva: 0
                    },
                    compras: tipo === 'compras' ? {
                        total: totales.total,
                        neto: totales.neto,
                        ivaRecuperable: totales.ivaRecuperable
                    } : {
                        total: 0,
                        neto: 0,
                        ivaRecuperable: 0
                    },
                    fechaActualizacion: new Date()
                });
                await nuevoResumen.save();
                console.log(`✅ Nuevo resumen creado para periodo ${periodo}`);
            }
        } catch (error) {
            console.error(`❌ Error al actualizar resumen para periodo ${periodo}:`, error);
            throw error;
        }
    }
};

module.exports = apiController;