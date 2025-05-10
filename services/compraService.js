const axios = require('axios');
const procesarCompras = require('../config/procesarCompras');
const ConfigUserSii = require('../models/configUserSii');
const Config = require('../models/Config');
const Compras = require('../models/Compras');
const ResumenMensualCompras = require('../models/ResumenMensualCompras');

const API_URL = process.env.API_URL || 'https://servicios.simpleapi.cl';

const fetchCompras = async ({ fecha, mes, anio }, config, passwordSII) => {
    const configSii = await ConfigUserSii.findOne();
    if (!configSii) {
        throw new Error('No se encontraron datos de configuración del SII');
    }

    let url = '';
    if (fecha) {
        const [anio, mes, dia] = fecha.split('-');
        url = `${API_URL}/api/RCV/compras/${dia}/${mes}/${anio}`;
        console.log("📆 Consultando compras por día:", fecha, "→ URL generada:", url);
    } else if (mes && anio) {
        url = `${API_URL}/api/RCV/compras/${mes}/${anio}`;
        console.log("📅 Consultando compras por mes:", mes, anio, "→ URL generada:", url);
    } else {
        throw new Error('Parámetros de consulta inválidos');
    }

    const finalApiUser = config?.apiUser || process.env.USER_API;
    const finalApiKey = config?.apiKey || process.env.PASSWORD_API;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${finalApiUser}:${finalApiKey}`).toString('base64'),
    };

    const body = {
        RutUsuario: configSii.rutUsuario,
        PasswordSII: passwordSII,
        RutEmpresa: configSii.rutEmpresa,
        Ambiente: configSii.ambiente,
    };

    console.log('📤 Enviando solicitud a la API de compras:', {
        url,
        headers,
        body
    });

    try {
        const response = await axios.post(url, body, { headers, timeout: 120000 });
        console.log('✅ Respuesta de la API de compras:', response.data);

        if (!response.data?.compras?.detalleCompras) {
            throw new Error('No se encontraron compras en la respuesta');
        }

        const compras = procesarCompras(response.data.compras.detalleCompras);
        if (compras.length === 0) {
            console.warn("⚠️ No se procesaron compras.");
            throw new Error("No se procesaron compras.");
        }

        return {
            compras,
            resumenes: response.data.compras.resumenes || [],
            caratula: response.data.caratula || {}
        };
    } catch (error) {
        if (error.response) {
            console.error('❌ Detalles del error de la API de compras:', error.response.status, error.response.data);
            if (error.response.status === 401) {
                throw new Error('Error de autenticación. Verifica tus credenciales.');
            }
        } else {
            console.error('❌ Error al consultar la API de compras:', error.message);
        }
        throw error;
    }
};

const saveCompras = async (compras) => {
    if (!compras || compras.length === 0) {
        console.log('⚠️ No hay compras para guardar.');
        return { saved: false, message: 'No hay compras para guardar.', savedCount: 0, updatedCount: 0 };
    }

    try {
        // Obtener las compras existentes en la base de datos
        const existingFolios = await Compras.find({
            folio: { $in: compras.map(c => c.folio) },
            tipoDTE: { $in: compras.map(c => c.tipoDTE) }
        }, { folio: 1, tipoDTE: 1, modificadoPor: 1 });

        const existingMap = new Map();
        const existingDataMap = new Map();
        existingFolios.forEach(c => {
            const key = `${c.folio}-${c.tipoDTE}`;
            existingMap.set(key, true);
            existingDataMap.set(key, c);
        });

        let savedCount = 0;
        let updatedCount = 0;

        // Separar compras nuevas y compras a actualizar
        const newCompras = [];
        const comprasToUpdate = [];

        compras.forEach(compra => {
            const key = `${compra.folio}-${compra.tipoDTE}`;
            if (existingMap.has(key)) {
                const existingData = existingDataMap.get(key);
                // Preservar campos específicos de la compra existente
                comprasToUpdate.push({
                    ...compra,
                    modificadoPor: existingData.modificadoPor,
                    fechaModificacion: new Date()
                });
            } else {
                newCompras.push({
                    ...compra,
                    modificadoPor: 'SISTEMA',
                    fechaModificacion: new Date()
                });
            }
        });

        // Guardar nuevas compras
        if (newCompras.length > 0) {
            const savedNewCompras = await Compras.insertMany(newCompras, { ordered: false });
            savedCount = savedNewCompras.length;
            console.log(`✅ Guardadas ${savedCount} nuevas compras`);
        }

        // Actualizar compras existentes
        if (comprasToUpdate.length > 0) {
            const updatePromises = comprasToUpdate.map(compra => {
                return Compras.updateOne(
                    { folio: compra.folio, tipoDTE: compra.tipoDTE },
                    { $set: compra }
                );
            });

            const updateResults = await Promise.all(updatePromises);
            updatedCount = updateResults.filter(result => result.modifiedCount > 0).length;
            console.log(`✅ Actualizadas ${updatedCount} compras existentes`);
        }

        return {
            saved: true,
            message: `Proceso completado: ${savedCount} nuevas compras guardadas, ${updatedCount} compras actualizadas.`,
            savedCount,
            updatedCount
        };
    } catch (error) {
        console.error('❌ Error al guardar compras:', error);
        throw error;
    }
};

const updateResumenMensualCompras = async (periodo, documentos) => {
    try {
        if (!Array.isArray(documentos)) {
            console.error(`❌ Error: 'documentos' no es un array válido, recibido: ${documentos}`);
            throw new Error("El parámetro 'documentos' debe ser un array");
        }

        console.log(`🔄 Actualizando ResumenMensualCompras para el periodo: ${periodo} con ${documentos.length} documentos`);

        // Obtener el resumen actual del período
        let resumenActual = await ResumenMensualCompras.findOne({ periodo });
        if (!resumenActual) {
            resumenActual = new ResumenMensualCompras({
                periodo,
                totalFacturas: 0,
                totalNotasCredito: 0,
                montoNeto: 0,
                foliosProcesados: []
            });
        }

        // Crear un mapa de folios procesados para acceso rápido
        const foliosProcesadosMap = new Map();
        resumenActual.foliosProcesados.forEach(fp => {
            const key = `${fp.folio}-${fp.tipoDTE}`;
            foliosProcesadosMap.set(key, fp);
        });

        let totalFacturas = resumenActual.totalFacturas;
        let totalNotasCredito = resumenActual.totalNotasCredito;
        const nuevosFoliosProcesados = [];

        // Procesar cada documento
        documentos.forEach(doc => {
            const key = `${doc.folio}-${doc.tipoDTE}`;
            const montoTotalDoc = Number(doc.montoTotal) || 0;
            const folioProcesado = foliosProcesadosMap.get(key);

            if (folioProcesado) {
                // Si el folio ya existe, restar su monto anterior
                if (folioProcesado.tipoDTE === 33) {
                    totalFacturas -= folioProcesado.montoTotal;
                } else if (folioProcesado.tipoDTE === 61) {
                    totalNotasCredito -= folioProcesado.montoTotal;
                }
            }

            // Sumar el nuevo monto
            if (doc.tipoDTE === 33) {
                totalFacturas += montoTotalDoc;
            } else if (doc.tipoDTE === 61) {
                totalNotasCredito += montoTotalDoc;
            }

            // Agregar o actualizar el folio procesado
            nuevosFoliosProcesados.push({
                folio: doc.folio,
                tipoDTE: doc.tipoDTE,
                montoTotal: montoTotalDoc,
                fechaProcesamiento: new Date()
            });
        });

        const montoNeto = totalFacturas - totalNotasCredito;

        console.log(`📊 Calculados: totalFacturas=${totalFacturas}, totalNotasCredito=${totalNotasCredito}, montoNeto=${montoNeto}`);

        // Actualizar el resumen
        const result = await ResumenMensualCompras.updateOne(
            { periodo },
            {
                $set: {
                    totalFacturas,
                    totalNotasCredito,
                    montoNeto,
                    fechaActualizacion: new Date(),
                    foliosProcesados: nuevosFoliosProcesados
                }
            },
            { upsert: true }
        );

        console.log(`📊 Resultado de la actualización de ResumenMensualCompras:`, result);
        if (result.matchedCount === 0 && result.upsertedCount === 1) {
            console.log(`✅ Nuevo periodo ${periodo} creado en ResumenMensualCompras`);
        } else if (result.modifiedCount > 0) {
            console.log(`✅ Periodo ${periodo} actualizado en ResumenMensualCompras`);
        } else {
            console.log(`ℹ️ No se hicieron cambios en ResumenMensualCompras para el periodo ${periodo}`);
        }
    } catch (error) {
        console.error('❌ Error al actualizar ResumenMensualCompras:', error);
        throw error;
    }
};

module.exports = {
    fetchCompras,
    saveCompras,
    updateResumenMensualCompras
}; 