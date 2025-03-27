const rateLimit = require('express-rate-limit');

// Rate limit específico para la ruta de login
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    message: 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.',
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Solo aplicar a la ruta de login
        return req.path !== '/auth/login';
    },
    handler: (req, res) => {
        console.log('🚫 Rate limit alcanzado para IP:', req.ip);
        console.log('📊 Intentos restantes:', res.getHeader('X-RateLimit-Remaining'));
        console.log('⏰ Tiempo de espera restante:', res.getHeader('X-RateLimit-Reset'));

        // Guardar el mensaje de error en la sesión
        req.session.error = 'Demasiados intentos de inicio de sesión. Por favor, intente nuevamente en 15 minutos.';

        // Redirigir a la página de login
        return res.redirect('/auth/login');
    }
});

// Rate limit para rutas de API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 solicitudes por minuto
    message: 'Demasiadas solicitudes. Por favor, intente nuevamente en un minuto.',
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limit para rutas de consulta de facturas
const facturasLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 consultas por minuto
    message: 'Demasiadas consultas de facturas. Por favor, intente nuevamente en un minuto.',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    loginLimiter,
    apiLimiter,
    facturasLimiter
}; 