const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config({ path: '.env' });
const Facturas = require('../models/Facturas');
const procesarFacturas = require('../config/procesarFacturas');

const API_URL = process.env.API_URL;
const USER_API = process.env.USER_API;
const PASSWORD_API = process.env.PASSWORD_API;
const RUT_USUARIO_SII = String(process.env.RUT_USUARIO);
const RUT_EMPRESA = String(process.env.RUT_EMPRESA);
const PASSWORD_SII = String(process.env.PASSWORD_SII);
const AMBIENTE = Number(process.env.AMBIENTE);

// Ruta para consultar facturas por día o por mes
router.get('/consulta', async (req, res) => {
    try {
        console.log("🟢 Recibida consulta con parámetros:", req.query); // Verifica los parámetros recibidos

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

        console.log("📤 Enviando solicitud a la API con body:", body);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${USER_API}:${PASSWORD_API}`).toString('base64')
        };

        console.log("🔐 Headers enviados:", headers);

        const response = await axios.post(url, body, { headers });

        console.log("✅ Respuesta de la API recibida:", response.data);

        if (!response.data || !response.data.ventas || !response.data.ventas.detalleVentas) {
            console.warn("⚠️ Respuesta de la API no contiene ventas válidas.");
            return res.status(400).json({ error: "No se encontraron ventas en la respuesta de la API." });
        }

        console.log("📦 Datos de ventas obtenidos:", response.data.ventas.detalleVentas);

        const facturas = procesarFacturas(response.data.ventas.detalleVentas);

        console.log("🔄 Facturas procesadas:", facturas);

        if (facturas.length === 0) {
            console.warn("⚠️ No se procesaron facturas.");
            return res.status(400).json({ error: "No se procesaron facturas." });
        }

        try {
            const result = await Facturas.insertMany(facturas);
            console.log("💾 Facturas guardadas en la base de datos:", result);
        } catch (dbError) {
            console.error("❌ Error al guardar las facturas en la base de datos:", dbError);
            return res.status(500).json({ error: "Error al guardar las facturas en la base de datos." });
        }

        console.log("🟢 Enviando respuesta a la vista.");
        res.render('consultarFacturas', { consultaRealizada: true, facturas: facturas });

    } catch (error) {
        console.error("❌ Error en la consulta:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || "Error en la consulta" });
    }
});

module.exports = router;
