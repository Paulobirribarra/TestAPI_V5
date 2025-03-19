// middleware/auth.js
const ConfigUserSii = require('../models/configUserSii');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    console.log('🚫 Usuario no autenticado, redirigiendo a /auth/login');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    console.log('🚫 Acceso denegado: no es admin - usuario:', req.user?.email);
    res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
};

const checkPasswordSII = async (req, res, next) => {
    console.log('🔍 checkPasswordSII - session passwordSII:', req.session.passwordSII, 'expires:', req.session.passwordSIIExpires);
    if (req.session.passwordSII && req.session.passwordSIIExpires > Date.now()) {
        const configSii = await ConfigUserSii.findOne();
        console.log('📡 configSii encontrado:', configSii);
        if (configSii && await configSii.comparePassword(req.session.passwordSII)) {
            console.log('✅ Password SII válido');
            return next();
        }
        console.log('❌ Password SII no coincide o no se encontró configSii');
    }
    console.log('🚫 Password SII no válido o expirado, redirigiendo a /consulta');
    res.redirect('/consulta');
};

module.exports = { isAuthenticated, isAdmin, checkPasswordSII };