//api.js
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
        const { fecha, mes, anio } = req.query;
        let url = '';

        // Si se pasa una fecha, la consulta es por día
        if (fecha) {
            const [dia, mes, anio] = fecha.split('-');
            url = `${API_URL}/api/RCV/ventas/${anio}/${mes}/${dia}`;
        } else if (mes && anio) {
            url = `${API_URL}/api/RCV/ventas/${mes}/${anio}`;
        } else {
            return res.status(400).json({ error: "Debes proporcionar una fecha (DD-MM-YYYY) o un mes y año (MM-YYYY)." });
        }

        const body = {
            RutUSuario: RUT_USUARIO_SII,
            PassWordSII: PASSWORD_SII,
            RutEmpresa: RUT_EMPRESA,
            Ambiente: AMBIENTE
        };

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(`${USER_API}:${PASSWORD_API}`).toString('base64')
        };

        console.log("🔍 URL enviada:", url);
        //console.log("🔍 Body:", body);

        const response = await axios.post(url, body, { headers });
        //console.log("✅ Respuesta de la API:", response.data);

        // Verifica si los datos de la API son válidos
        if (!response.data || !response.data.ventas || !response.data.ventas.detalleVentas) {
            return res.status(400).json({ error: "No se encontraron ventas en la respuesta de la API." });
        }

        // Procesa las facturas
        const facturas = procesarFacturas(response.data.ventas.detalleVentas);
        
        if (facturas.length === 0) {
            return res.status(400).json({ error: "No se procesaron facturas." });
        }

        // Guarda las facturas en la base de datos
        try {
            const result = await Facturas.insertMany(facturas);
            //console.log("✅ Facturas guardadas:", result);
        } catch (dbError) {
            console.error("❌ Error al guardar las facturas:", dbError);
            return res.status(500).json({ error: "Error al guardar las facturas en la base de datos." });
        }

        // Pasar solo los datos necesarios para renderizar la vista
        res.render('consultarFacturas', { consultaRealizada: true, facturas: facturas });

    } catch (error) {
        console.error("❌ Error en la consulta:", error.response?.data || error.message);
        res.status(500).json({ error: error.response?.data || "Error en la consulta" });
    }
});


module.exports = router;
