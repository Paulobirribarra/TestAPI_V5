//app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env' });

//servidor 
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware para parsear JSON
app.use(express.json());

//Importar Rutas
const routeAPI = require('./routes/api');
const conectarDB = require('./config/BDConection');

//Coneccion a mongo
conectarDB();

//Usar Rutas Importadas esto hace que todas las rutas que vienen de api.js se monten en /api/consultas 
app.use('/api', routeAPI);

//Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`)
});

//Ruta PRINCIPAL
app.get('/', (req, res) => {
    res.redirect('/api/consulta');
});

app.use((req, res, next) => {
    console.log(`📌 Se recibió una solicitud en: ${req.originalUrl}`);
    next();
});
