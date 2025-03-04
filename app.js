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
    saveUninitialized: false
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());


// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());


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

//Auth
app.use('/auth', authRoutes);


// Ruta específica para consulta
app.get('/consulta', (req, res) => res.render('consultarFacturas'));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});