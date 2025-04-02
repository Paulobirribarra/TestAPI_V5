// app.js
const express = require('express');
const { configureServer, PORT } = require('./config/server');
const connectDB = require('./config/database');
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
const facturasRoutes = require('./routes/facturasRoutes');

// Crear la aplicación Express
const app = express();

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

        // Configurar el servidor
        configureServer(app);

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

        app.use(upload.none());
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
        app.use('/facturas', facturasRoutes);
        app.use(require('./middleware/errorHandler'));

        const options = {
            key: fs.readFileSync('config/key.pem'),
            cert: fs.readFileSync('config/cert.pem')
        };

        // Crear servidor HTTPS
        const httpsServer = https.createServer(options, app);
        httpsServer.listen(PORT, () => {
            console.log(`Servidor HTTPS corriendo en https://localhost:${PORT}`);
        });

        // Crear servidor HTTP para redirigir a HTTPS
        const httpServer = http.createServer((req, res) => {
            res.writeHead(301, { Location: `https://${req.headers.host}${req.url}` });
            res.end();
        });
        httpServer.listen(80, () => {
            console.log('Servidor HTTP redirigiendo a HTTPS en http://localhost:80');
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
})();