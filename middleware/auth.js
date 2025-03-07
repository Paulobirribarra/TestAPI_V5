// middleware/auth.js
const ConfigUserSii = require('../models/configUserSii');

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
};

const checkPasswordSII = async (req, res, next) => {
    if (req.session.passwordSII && req.session.passwordSIIExpires > Date.now()) {
        const configSii = await ConfigUserSii.findOne();
        if (await configSii.comparePassword(req.session.passwordSII)) {
            return next();
        }
    }
    res.redirect('/consulta'); // Redirige para pedir el password
};

module.exports = { isAuthenticated, isAdmin, checkPasswordSII };