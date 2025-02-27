const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config({ path: '.env' });
const Facturas = require('../models/Facturas');
const procesarFacturas = require('../config/procesarFacturas');
const Config = require('../models/Config');

// Variables del .env (mantendremos estas por ahora para comparación)
const API_URL = process.env.API_URL;
const USER_API = process.env.USER_API;
const PASSWORD_API = process.env.PASSWORD_API;
const RUT_USUARIO_SII = String(process.env.RUT_USUARIO);
const RUT_EMPRESA = String(process.env.RUT_EMPRESA);
const PASSWORD_SII = String(process.env.PASSWORD_SII);
const AMBIENTE = Number(process.env.AMBIENTE);

// Ruta para guardar la configuración
router.post('/config', async (req, res) => {
    const { apiUser, apiKey } = req.body;
    try {
        await Config.findOneAndUpdate(
            {},
            { apiUser, apiKey },
            { upsert: true, new: true }
        );
        console.log('✅ Configuración guardada en la base de datos:', { apiUser, apiKey });
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error al guardar configuración:', error);
        res.status(500).json({ error: 'Error al guardar la configuración' });
    }
});

// Ruta para consultar facturas por día o por mes
router.get('/consulta', async (req, res) => {
    try {
        // Obtener la configuración desde la base de datos
        const config = await Config.findOne();
        console.log('📋 Configuración cargada desde la base de datos:', config ? { apiUser: config.apiUser, apiKey: '[oculta]' } : 'No encontrada');

        // Comparar con valores del .env
        console.log('📋 Valores del .env:', { USER_API, PASSWORD_API: '[oculta]' });

        if (!config) {
            console.warn('⚠️ No se encontró configuración en la base de datos, usando valores del .env como fallback');
            if (!USER_API || !PASSWORD_API) {
                return res.status(400).json({ error: 'No se ha configurado la API Key ni en la base de datos ni en el .env' });
            }
        }

        const API_URL = 'https://servicios.simpleapi.cl'; // URL fija
        const { fecha, mes, anio } = req.query;
        let url = '';

        if (fecha) {
            const [anio, mes, dia] = fecha.split('-');
            url = `${API_URL}/api/RCV/ventas/${dia}/${mes}/${anio}`;
            console.log("📆 Consultando por día:", fecha, "→ URL generada:", url);
        } else if (mes && anio) {
            url = `${API_URL}/api/RCV/ventas/${mes}/${anio}`;
            console.log("📅 Consultando por mes:", mes, anio, "→ URL generada:", url);
        } else {
            console.warn("⚠️ Parámetros inválidos en la consulta.");
            return res.status(400).json({ error: "Debes proporcionar una fecha (YYYY-MM-DD) o un mes y año (YYYY-MM)." });
        }

        const body = {
            RutUSuario: RUT_USUARIO_SII,
            PassWordSII: PASSWORD_SII,
            RutEmpresa: RUT_EMPRESA,
            Ambiente: AMBIENTE
        };

        // Usar valores de la base de datos si existen, sino fallback al .env
        const finalApiUser = config ? config.apiUser : USER_API;
        const finalApiKey = config ? config.apiKey : PASSWORD_API;
        console.log('🔑 Valores finales usados para la consulta:', { finalApiUser, finalApiKey: '[oculta]' });

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${finalApiUser}:${finalApiKey}`).toString('base64')
        };

        console.log('📤 Enviando solicitud a la API con headers:', { 'Content-Type': headers['Content-Type'], Authorization: '[oculta]' });
        const response = await axios.post(url, body, { headers });

        if (!response.data || !response.data.ventas || !response.data.ventas.detalleVentas) {
            console.warn("⚠️ Respuesta de la API no contiene ventas válidas.");
            return res.status(400).json({ error: "No se encontraron ventas en la respuesta de la API." });
        }

        const facturas = procesarFacturas(response.data.ventas.detalleVentas);
        await Facturas.insertMany(facturas);
        console.log('💾 Facturas guardadas en la base de datos, cantidad:', facturas.length);

        res.json({ consultaRealizada: true, facturas });
    } catch (error) {
        console.error("❌ Error en la consulta:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || "Error en la consulta" });
    }
});


// Ruta temporal para actualizar facturas con tipoDocReferencia: 48
router.get('/actualizar-facturas-pagadas', async (req, res) => {
    try {
        // Buscar facturas con tipoDocReferencia: 48 y pagada: false
        const facturas = await Facturas.find({
            tipoDocReferencia: 48,
            pagada: false
        });

        console.log(`📋 Facturas encontradas para actualizar: ${facturas.length}`);

        // Actualizar cada factura encontrada
        for (const factura of facturas) {
            await Facturas.updateOne(
                { _id: factura._id },
                {
                    pagada: true,
                    estado: 'Pagada',
                    metodoDePago: 'contado', // Ajusta este valor si es necesario
                    pagadaAutomaticamente: true,
                    numeroDeOperacion: factura.folioDocReferencia
                }
            );
        }

        console.log('✅ Facturas actualizadas correctamente');
        res.json({ success: true, message: 'Facturas actualizadas correctamente' });
    } catch (error) {
        console.error('❌ Error al actualizar facturas:', error);
        res.status(500).json({ error: 'Error al actualizar las facturas' });
    }
});

module.exports = router;