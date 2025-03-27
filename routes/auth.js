const express = require('express');
const router = express.Router();
const passport = require('../config/Passport');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../config/rateLimits');

// Página de login
router.get('/login', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        console.log('📄 Renderizando página de login');
        console.log('📝 Mensajes de sesión:', {
            messages: req.session.messages,
            success: req.session.success,
            error: req.session.error
        });
        res.render('auth/login', {
            message: req.session.messages || null,
            success: req.session.success || null,
            showRegisterLink: userCount === 0,
            error: req.session.error || null
        });
        req.session.messages = null;
        req.session.success = null;
        req.session.error = null;
    } catch (error) {
        console.log('🚨 Error al verificar usuarios:', error);
        res.status(500).send('Error interno');
    }
});

// Procesar login con rate limit
router.post('/login', loginLimiter, (req, res, next) => {
    console.log('📩 POST recibido en /auth/login');
    console.log('🔑 Datos de login:', {
        email: req.body.email,
        ip: req.ip,
        userAgent: req.get('user-agent')
    });

    // Verificar si hay un error de rate limit
    if (req.session.error) {
        return res.redirect('/auth/login');
    }

    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/auth/login',
        failureMessage: true
    }, (err, user, info) => {
        if (err) {
            console.log('❌ Error en autenticación:', err);
            return next(err);
        }
        if (!user) {
            console.log('❌ Autenticación fallida:', info);
            req.session.messages = info.message;
            return res.redirect('/auth/login');
        }
        console.log('✅ Login exitoso para usuario:', user.email);
        req.logIn(user, (err) => {
            if (err) {
                console.log('🚨 Error al iniciar sesión:', err);
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

// Página de registro
router.get('/register', async (req, res) => {
    try {
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            return res.render('auth/register', { error: null, isFirstUser: true, name: '', email: '', role: 'admin' });
        }
        isAuthenticated(req, res, () => isAdmin(req, res, () => {
            res.render('auth/register', { error: null, isFirstUser: false, name: '', email: '', role: 'lector' });
        }));
    } catch (error) {
        console.log('🚨 Error al verificar usuarios:', error);
        res.status(500).send('Error interno');
    }
});

// Procesar registro
router.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log('📩 POST recibido en /auth/register:', req.body);

    let userCount;
    try {
        userCount = await User.countDocuments();
    } catch (error) {
        console.log('🚨 Error al contar usuarios:', error);
        return res.render('auth/register', {
            error: 'Error al verificar usuarios. Intenta nuevamente.',
            isFirstUser: false,
            name: name || '',
            email: email || '',
            role: role || 'lector'
        });
    }

    // Validar nombre (solo letras y espacios, 2-50 caracteres)
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]{2,50}$/;
    if (!nameRegex.test(name)) {
        return res.render('auth/register', {
            error: 'El nombre debe tener 2-50 caracteres y solo letras o espacios.',
            isFirstUser: userCount === 0,
            name: name || '',
            email: email || '',
            role: role || (userCount === 0 ? 'admin' : 'lector')
        });
    }

    // Validar email (básico)
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email)) {
        return res.render('auth/register', {
            error: 'Por favor, ingresa un correo electrónico válido.',
            isFirstUser: userCount === 0,
            name: name || '',
            email: email || '',
            role: role || (userCount === 0 ? 'admin' : 'lector')
        });
    }

    try {
        const isFirstUser = userCount === 0;
        const newRole = isFirstUser ? 'admin' : role || 'lector';

        const user = new User({
            name,
            email: email.toLowerCase(),
            password,
            role: newRole
        });

        await user.save();

        req.session.success = 'Usuario registrado con éxito.';
        return res.redirect(isFirstUser ? '/auth/login' : '/');
    } catch (error) {
        console.log('🚨 Error al registrar usuario:', error);

        let errorMessage = 'Error al registrar usuario.';
        if (error.name === 'ValidationError') {
            errorMessage = Object.values(error.errors)
                .map(err => err.message)
                .join(', ');
        } else if (error.code === 11000) {
            errorMessage = 'El correo ya está registrado.';
        }

        return res.render('auth/register', {
            error: errorMessage,
            isFirstUser: userCount === 0,
            name: name || '',
            email: email || '',
            role: role || (userCount === 0 ? 'admin' : 'lector')
        });
    }
});

// Logout (sin cambios)
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

// Verificar si un email ya está registrado (para validación AJAX)
router.get('/check-email', async (req, res) => {
    const { email } = req.query;
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (user) {
            return res.json({ available: false, message: 'El correo ya está registrado.' });
        }
        return res.json({ available: true });
    } catch (error) {
        console.log('🚨 Error al verificar email:', error);
        return res.status(500).json({ available: false, message: 'Error al verificar el email.' });
    }
});

module.exports = router;