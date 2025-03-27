const cors = require('cors');

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? ['https://tudominio.com'] // Reemplazar con tu dominio en producción
        : ['http://localhost:3000'], // Dominios permitidos en desarrollo
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
};

const corsMiddleware = cors(corsOptions);

module.exports = corsMiddleware; 