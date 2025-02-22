//api.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
require('dotenv').config({path:'.env'});

const API_URL = process.env.API_URL;
const USER_API = process.env.USER_API;
const PASSWORD_API = process.env.PASSWORD_API;

const RUT_USUARIO_SII = String(process.env.RUT_USUARIO);
const RUT_EMPRESA = String(process.env.RUT_EMPRESA);
const PASSWORD_SII = String(process.env.PASSWORD_SII);
const AMBIENTE = Number(process.env.AMBIENTE);
const DETALLADO = process.env.DETALLADO;


router.get('/consulta', async (req, res) => {
    try{
        const mes = req.query.mes || '01';
        const anio = req.query.anio || '2024';
        const url = `${API_URL}/api/RCV/ventas/${mes}/${anio}`;
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
        // 📌 Log para verificar que los datos están bien formateados antes de enviarlos
        console.log("🔍 Enviando consulta con body:", body);
        console.log("🔍 Headers:", headers);
        console.log(`Esta es la URL completa a enviar: ${url}`);

        const response = await axios.post(url, body, {headers});
        console.log("✅ Respuesta de la API:", response.data);
        console.log("🧐 Respuesta completa de la API:", response.headers);

        res.json(response.data);
    }catch (error){
        console.error("Error en la consulta:", error.response?.data || error.message);
        if (error.response?.status === 401) {
            return res.status(401).json({ error: "Error de autenticación en Simple API" });
        }

        if (error.response?.status === 400 && error.response?.data?.mensaje?.includes('Error de autenticación en el SII')) {
            return res.status(400).json({ error: "Las credenciales del SII no son válidas." });
        }

        res.status(500).json({ error: error.response?.data || "Error en la consulta" });
    }
});


// console.log(`${RUT_USUARIO_SII}`);
// console.log(`${PASSWORD_SII}`);
// console.log(`${RUT_EMPRESA}`);
// console.log(AMBIENTE);
// console.log(DETALLADO);
// console.log(`${USER_API}`)
// console.log(`${PASSWORD_API}`)
// console.log(`${API_URL}`)


module.exports = router;