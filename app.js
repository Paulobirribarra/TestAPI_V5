const { app } = require('./config/server');
const connectDB = require('./config/database');
const express = require('express');
const session = require('express-session');
const passport = require('./config/Passport');
const { isAuthenticated, isAdmin } = require('./middleware/auth');
const Config = require('./models/Config');
const multer = require('multer');
const https = require('https');
const http = require('http');
const fs = require('fs');
const helmet = require('helmet');
const corsMiddleware = require('./config/cors');
const { loginLimiter, apiLimiter, facturasLimiter } = require('./config/rateLimits');

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
        const config = await Config.findOne() || await new Config({ apiKey: 'default-key', apiUser: 'default-user' }).save();
        const sessionSecret = config.sessionSecret;

        app.use(helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/",
                        "https://cdn.jsdelivr.net/npm/chart.js"]
                }
            }
        })); // Añadir Helmet

        // Aplicar CORS
        app.use(corsMiddleware);

        // Aplicar rate limits
        app.use('/auth/login', loginLimiter);
        app.use('/api', apiLimiter);
        app.use('/consultarFacturas', facturasLimiter);

        app.use(session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: true,
                httpOnly: true,
                maxAge: 2 * 60 * 60 * 1000, // 2 horas
                sameSite: 'strict'
            }
        }));

        // Middleware para inicializar propiedades de la sesión
        app.use((req, res, next) => {
            if (!req.session.messages) req.session.messages = null;
            if (!req.session.success) req.session.success = null;
            if (!req.session.error) req.session.error = null;
            next();
        });

        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(upload.none());
        app.use('/', express.static('public'));
        app.use(passport.initialize());
        app.use(passport.session());

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

        app.use('/api', apiRoutes);
        app.use('/', indexRoutes);
        app.use('/notasDeCredito', notasDeCreditoRoutes);
        app.use('/configuracion', configRoutes);
        app.use('/auth', authRoutes);
        app.use('/resumenMensual', resumenMensualRoutes);
        app.use(require('./middleware/errorHandler'));

        const options = {
            key: fs.readFileSync('config/key.pem'),
            cert: fs.readFileSync('config/cert.pem')
        };

        https.createServer(options, app).listen(3000, () => {
            console.log('Servidor HTTPS corriendo en https://localhost:3000');
        });

        http.createServer((req, res) => {
            res.writeHead(301, { Location: `https://localhost:3000${req.url}` });
            res.end();
        }).listen(80, () => {
            console.log('Servidor HTTP redirigiendo a HTTPS en http://localhost:80');
        });
    } catch (error) {
        console.error('Error al iniciar la aplicación:', error);
        process.exit(1);
    }
})();