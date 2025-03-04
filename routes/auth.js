const express = require('express');
const router = express.Router();
const passport = require('../config/Passport');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth'); // Importar middlewares

// Página de login
router.get('/login', (req, res) => {
    console.log('📄 Renderizando página de login, mensajes:', req.session.messages);
    res.render('auth/login', { message: req.session.messages });
    req.session.messages = null; // Limpiar mensajes después de mostrarlos
});

// Procesar login
router.post('/login', (req, res, next) => {
    console.log('📩 POST recibido en /auth/login:', req.body);
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureMessage: true
    })(req, res, next);
});

// Página de registro (solo admin puede registrar usuarios)
router.get('/register', isAuthenticated, isAdmin, (req, res) => {
    res.render('auth/register', { error: null });
});

// Procesar registro
router.post('/register', isAuthenticated, isAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('auth/register', { error: 'El usuario ya existe' });
        }
        const user = new User({ username, password, role });
        await user.save();
        res.redirect('/');
    } catch (error) {
        res.render('auth/register', { error: 'Error al registrar usuario' });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect('/auth/login');
    });
});

module.exports = router;