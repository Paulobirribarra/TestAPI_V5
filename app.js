// app.js
const { app, PORT } = require('./config/server');
const connectDB = require('./config/database');

//Auth
const passport = require('./config/Passport');
const session = require('express-session');
const { isAuthenticated, isAdmin } = require('./middleware/auth');// Importar isAdmin

// Rutas
const apiRoutes = require('./routes/api');
const indexRoutes = require('./routes/index');
const notasDeCreditoRoutes = require('./routes/notasDeCredito');
const configRoutes = require('./routes/config');

//Auth
const authRoutes = require('./routes/auth');

// Conectar a la base de datos
connectDB();

// Configuración de sesiones
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Cambia a `true` si usas HTTPS en producción
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'strict' // Evita que la cookie se envíe en solicitudes cruzadas
    }
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());


// Middleware global para evitar caché en páginas protegidas
app.use((req, res, next) => {
    if (!req.isAuthenticated() && req.path !== '/auth/login' && !req.path.startsWith('/auth')) {
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');
        return res.redirect('/auth/login');
    }
    next();
});

// Middleware para pasar el usuario a las vistas
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});


//=============================================================//
// Montar rutas
app.use('/api', apiRoutes);
app.use('/', indexRoutes);
app.use('/notasDeCredito', notasDeCreditoRoutes);
app.use('/configuracion', configRoutes);
app.use('/auth', authRoutes);
app.use(require('./middleware/errorHandler'));

// Ruta específica para consulta
//app.get('/consulta', (req, res) => res.render('consultarFacturas'));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});