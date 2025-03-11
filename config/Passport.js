// config/Passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
    {
        usernameField: 'email', // Campo que usa el formulario de login
        passwordField: 'password'
    },
    async (email, password, done) => {
        console.log('🔍 Intentando autenticar email:', email);
        try {
            const user = await User.findOne({ email: email.toLowerCase() });
            if (!user) {
                console.log('❌ Email no encontrado');
                return done(null, false, { message: 'Correo no encontrado' });
            }
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                console.log('❌ Contraseña incorrecta');
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            console.log('✅ Autenticación exitosa para:', email);
            return done(null, user);
        } catch (error) {
            console.log('🚨 Error en autenticación:', error);
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        console.log('🚨 Error en deserialización:', error);
        done(error);
    }
});

module.exports = passport;