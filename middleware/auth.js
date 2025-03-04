// middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === 'admin') return next();
    res.status(403).send('Acceso denegado. Requiere permisos de administrador.');
};

module.exports = { isAuthenticated, isAdmin };