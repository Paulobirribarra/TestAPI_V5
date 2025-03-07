// services/apiService.js
const axios = require('axios');
const procesarFacturas = require('../config/procesarFacturas');
const ConfigUserSii = require('../models/configUserSii');

const API_URL = process.env.API_URL || 'https://servicios.simpleapi.cl';

const fetchInvoices = async ({ fecha, mes, anio }, config, passwordSII) => {
    const configSii = await ConfigUserSii.findOne();
    if (!configSii) {
        throw new Error('No se encontraron datos de configuración del SII');
    }

    let url = '';
    if (fecha) {
        const [anio, mes, dia] = fecha.split('-');
        url = `${API_URL}/api/RCV/ventas/${dia}/${mes}/${anio}`;
        console.log("📆 Consultando por día:", fecha, "→ URL generada:", url);
    } else if (mes && anio) {
        url = `${API_URL}/api/RCV/ventas/${mes}/${anio}`;
        console.log("📅 Consultando por mes:", mes, anio, "→ URL generada:", url);
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
        PasswordSII: passwordSII, // Usar el valor plano de la sesión
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
};

module.exports = { fetchInvoices };