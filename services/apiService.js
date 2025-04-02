// services/apiService.js
const axios = require('axios');
const procesarFacturas = require('../config/procesarFacturas');
const ConfigUserSii = require('../models/configUserSii');
const { getNombreAleatorio } = require('../config/data');
const config = require('../config/config');

const API_URL = config.apiUrl;

// Función para obtener facturas
async function getInvoices(fecha) {
    try {
        console.log('🟢 Recibida consulta con parámetros:', fecha);

        // Obtener la configuración del usuario
        const configUser = await ConfigUserSii.findOne();
        if (!configUser) {
            throw new Error('No se encontró configuración de usuario');
        }

        // Si simulateApi es true, usar datos simulados
        if (config.simulateApi) {
            console.log('🔄 Usando datos simulados');
            const facturasSimuladas = await getSimulatedInvoices(fecha);
            console.log('✅ Datos simulados generados:', facturasSimuladas);
            return facturasSimuladas;
        }

        // Si no es simulación, usar la API real
        return await fetchInvoices(fecha, config, configUser.passwordSII);
    } catch (error) {
        console.error('❌ Error en getInvoices:', error.message);
        throw error;
    }
}

// Función para obtener facturas de la API real
async function fetchInvoices(fecha, config, passwordSII) {
    const configSii = await ConfigUserSii.findOne();
    if (!configSii) {
        throw new Error('No se encontraron datos de configuración del SII');
    }

    let url = '';
    if (fecha.fecha) {
        // Si es consulta por día específico
        const [anio, mes, dia] = fecha.fecha.split('-');
        url = `${API_URL}/api/RCV/ventas/${dia}/${mes}/${anio}`;
        console.log("📆 Consultando por día:", fecha.fecha, "→ URL generada:", url);
    } else if (fecha.mes && fecha.anio) {
        // Si es consulta por mes
        url = `${API_URL}/api/RCV/ventas/${fecha.mes}/${fecha.anio}`;
        console.log("📅 Consultando por mes:", fecha.mes, fecha.anio, "→ URL generada:", url);
    } else {
        throw new Error('Parámetros de consulta inválidos');
    }

    const finalApiUser = config.apiUser;
    const finalApiKey = config.apiKey;

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

    console.log('📤 Enviando solicitud a la API con URL:', url, 'encabezados:', headers, 'body:', body);

    console.time('API Response Time');
    try {
        const response = await axios.post(url, body, { headers, timeout: 120000 });
        console.timeEnd('API Response Time');
        console.log('✅ Respuesta de la API externa:', response.data);

        if (!response.data?.ventas?.detalleVentas) {
            throw new Error('No se encontraron ventas en la respuesta');
        }

        const facturas = procesarFacturas(response.data.ventas.detalleVentas);
        if (facturas.length === 0) {
            console.warn("⚠️ No se procesaron facturas.");
            throw new Error("No se procesaron facturas.");
        }

        return facturas;
    } catch (error) {
        console.timeEnd('API Response Time');
        if (error.response) {
            console.error('❌ Detalles del error de la API:', error.response.status, error.response.data);
        } else {
            console.error('❌ Error al consultar la API:', error.message);
        }
        throw error;
    }
}

// Función para simular respuesta de la API
async function getSimulatedInvoices(fecha) {
    try {
        console.log('🔄 Generando datos simulados para:', fecha);

        // Generar datos simulados
        const facturasSimuladas = [];
        const numFacturas = Math.floor(Math.random() * 10) + 5; // Entre 5 y 15 facturas

        // Determinar el formato de fecha y generar fechas aleatorias dentro del mes
        let fechasEmision = [];
        let periodo;
        if (fecha.mes && fecha.anio) {
            // Si es consulta por mes, generar fechas aleatorias dentro del mes
            const mes = parseInt(fecha.mes);
            const anio = parseInt(fecha.anio);
            const diasEnMes = new Date(anio, mes, 0).getDate();
            periodo = `${anio}${String(mes).padStart(2, '0')}`;

            // Generar fechas aleatorias para cada factura
            for (let i = 0; i < numFacturas; i++) {
                const dia = Math.floor(Math.random() * diasEnMes) + 1;
                fechasEmision.push(`${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`);
            }
        } else if (fecha.fecha) {
            // Si es consulta por día específico, usar esa fecha
            const [anio, mes] = fecha.fecha.split('-');
            periodo = `${anio}${mes}`;
            fechasEmision = Array(numFacturas).fill(fecha.fecha);
        } else {
            throw new Error('Formato de fecha no válido');
        }

        // Generar facturas con las fechas calculadas
        for (let i = 0; i < numFacturas; i++) {
            const montoNeto = Math.floor(Math.random() * 1000000) + 10000; // Entre 10,000 y 1,010,000
            const montoIva = Math.floor(montoNeto * 0.19);
            const montoTotal = montoNeto + montoIva;

            facturasSimuladas.push({
                tipoDTE: '33',
                folio: Math.floor(Math.random() * 1000) + 1,
                fechaEmision: fechasEmision[i],
                montoNeto: montoNeto,
                montoIva: montoIva,
                montoTotal: montoTotal,
                estado: Math.random() > 0.5 ? 'PAGADO' : 'PENDIENTE',
                razonSocial: getNombreAleatorio(),
                rut: Math.floor(Math.random() * 90000000) + 10000000 + '-' + Math.floor(Math.random() * 9) + 1,
                periodo: periodo,
                tipoDTENumber: 33,
                tipoDTEString: 'Factura Electrónica',
                rutCliente: Math.floor(Math.random() * 90000000) + 10000000 + '-' + Math.floor(Math.random() * 9) + 1,
                montoIVA: montoIva,
                montoIVARecuperable: montoIva,
                dia: parseInt(fechasEmision[i].split('-')[2]),
                mes: parseInt(fechasEmision[i].split('-')[1]),
                anio: parseInt(fechasEmision[i].split('-')[0])
            });
        }

        return facturasSimuladas;
    } catch (error) {
        console.error('❌ Error al generar datos simulados:', error.message);
        throw error;
    }
}

module.exports = { getInvoices, fetchInvoices };

