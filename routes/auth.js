// routes/auth.js
const express = require('express');
const router = express.Router();
const passport = require('../config/Passport');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

// Página de login (sin cambios)
router.get('/login', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        console.log('📄 Renderizando página de login, mensajes:', req.session.messages);
        res.render('auth/login', { 
            message: req.session.messages, 
            showRegisterLink: userCount === 0
        });
        req.session.messages = null;
    } catch (error) {
        console.log('🚨 Error al verificar usuarios:', error);
        res.status(500).send('Error interno');
    }
});

// Procesar login
router.post('/login', (req, res, next) => {
    console.log('📩 POST recibido en /auth/login:', req.body);
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureMessage: true
    }, (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.redirect('/auth/login');
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/');
        });
    })(req, res, next);
});

// Página de registro (sin cambios)
router.get('/register', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            return res.render('auth/register', { error: null, isFirstUser: true });
        }
        isAuthenticated(req, res, () => isAdmin(req, res, () => {
            res.render('auth/register', { error: null, isFirstUser: false });
        }));
    } catch (error) {
        console.log('🚨 Error al verificar usuarios:', error);
        res.status(500).send('Error interno');
    }
});

// Procesar registro (CAMBIOS AQUÍ)
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body; // Cambiar username por name y email
    console.log('📩 POST recibido en /auth/register:', req.body); // Para depurar
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const user = new User({ name, email: email.toLowerCase(), password, role: 'admin' });
            await user.save();
            return res.redirect('/auth/login');
        }
        isAuthenticated(req, res, () => isAdmin(req, res, async () => {
            const existingUser = await User.findOne({ email }); // Buscar por email, no username
            if (existingUser) {
                return res.render('auth/register', { error: 'El correo ya está registrado', isFirstUser: false });
            }
            const user = new User({ name, email: email.toLowerCase(), password, role });
            await user.save();
            res.redirect('/');
        }));
    } catch (error) {
        console.log('🚨 Error al registrar usuario:', error);
        res.render('auth/register', { error: 'Error al registrar usuario: ' + error.message, isFirstUser: false });
    }
});

// Logout
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            console.error('🚨 Error al cerrar sesión:', err);
            return next(err);
        }
        req.session.destroy((err) => {
            if (err) {
                console.error('🚨 Error al destruir la sesión:', err);
                return res.status(500).send('Error al cerrar sesión');
            }
            res.clearCookie('connect.sid');
            res.clearCookie('session');
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
            res.set('Pragma', 'no-cache');
            res.set('Expires', '0');
            res.redirect('/auth/login');
        });
    });
});

module.exports = router;