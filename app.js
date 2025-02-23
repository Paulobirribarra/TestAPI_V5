//app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: '.env' });

//servidor 
const app = express();
const PORT = process.env.PORT || 3000;

//Configurar motoro de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//configurar carpeta publica para servir archivos estáticos (css, imagenes)
app.use(express.static(path.join(__dirname, 'public')));

//Middleware para parsear JSON
app.use(express.json());

//Importar Rutas
const routeAPI = require('./routes/api');
const conectarDB = require('./config/BDConection');
const Facturas = require('./models/Facturas');
const indexRoutes = require('./routes/index');
const notasDeCreditoRoutes = require('./routes/notasDeCredito');


//Coneccion a mongo
conectarDB();

//Usar Rutas Importadas esto hace que todas las rutas que vienen de api.js se monten en /api/consultas 
app.use('/api', routeAPI);
app.use('/', indexRoutes);  // Ruta principal
app.use('/notasDeCredito', notasDeCreditoRoutes);  // Ruta para notas de crédito



app.get('/consulta', (req, res) => {
    res.render('consultarFacturas'); // Renderiza la vista correctamente
});


//Iniciar Servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${process.env.PORT}`)
});


// Ruta para mostrar todas las consultas 
// app.use((req, res, next) => {
//     console.log(`📌 Se recibió una solicitud en: ${req.originalUrl}`);
//     next();
// });
