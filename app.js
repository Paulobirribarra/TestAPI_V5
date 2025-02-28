// app.js
const { app, PORT } = require('./config/server');
const connectDB = require('./config/database');

// Rutas
const apiRoutes = require('./routes/api');
const indexRoutes = require('./routes/index');
const notasDeCreditoRoutes = require('./routes/notasDeCredito');
const configRoutes = require('./routes/config');

// Conectar a la base de datos
connectDB();

// Montar rutas
app.use('/api', apiRoutes);
app.use('/', indexRoutes);
app.use('/notasDeCredito', notasDeCreditoRoutes);
app.use('/configuracion', configRoutes);
app.use(require('./middleware/errorHandler'));

// Ruta específica para consulta
app.get('/consulta', (req, res) => res.render('consultarFacturas'));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});