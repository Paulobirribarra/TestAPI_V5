// config/server.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const configureServer = (app) => {
    // Configurar el motor de vistas
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, '../views'));

    // Middleware para archivos estáticos
    app.use(express.static(path.join(__dirname, '../public')));

    // Middleware para parsear JSON y datos de formularios
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};

module.exports = { configureServer, PORT };