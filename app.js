// app.js
const { app, PORT } = require('./config/server');
const connectDB = require('./config/database');
const express = require('express');
const session = require('express-session');
const passport = require('./config/Passport');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const Config = require('./models/Config'); 
const multer = require('multer'); 

// Configurar multer para manejar solo campos de formulario (sin archivos)
const upload = multer();

// Rutas
const apiRoutes = require('./routes/api');
const indexRoutes = require('./routes/index');
const notasDeCreditoRoutes = require('./routes/notasDeCredito');
const configRoutes = require('./routes/config');
const authRoutes = require('./routes/auth');
const resumenMensualRoutes = require('./routes/resumenMensual');

// Conectar a la base de datos
connectDB();

(async () => {
    try {
        // Obtener o crear el documento de configuración
        const config = await Config.findOne() || await new Config({ apiKey: 'default-key', apiUser: 'default-user' }).save();
        const sessionSecret = config.sessionSecret;

        // Configuración de sesiones
        app.use(session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false, // Cambia a `true` si usas HTTPS en producción
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                sameSite: 'strict'
            }
        }));

        // Middleware para parsear datos
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(upload.none()); // Usar multer para parsear multipart/form-data sin archivos
        app.use('/', express.static('public'));
        app.use(passport.initialize());
        app.use(passport.session());

        // Middleware global para evitar caché
        app.use((req, res, next) => {
            if (!req.isAuthenticated() && req.path !== '/auth/login' && !req.path.startsWith('/auth')) {
                res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
                res.set('Pragma', 'no-cache');
                res.set('Expires', '0');
                return res.redirect('/auth/login');
            }
            next();
        });

        app.use((req, res, next) => {
            res.locals.user = req.user || null;
            next();
        });

        // Montar rutas
        app.use('/api', apiRoutes);
        app.use('/', indexRoutes);
        app.use('/notasDeCredito', notasDeCreditoRoutes);
        app.use('/configuracion', configRoutes);
        app.use('/auth', authRoutes);
        app.use('/resumenMensual', resumenMensualRoutes);
        app.use(require('./middleware/errorHandler'));

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    }
})();