const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

passport.use(new LocalStrategy(
    {
        usernameField: 'username',
        passwordField: 'password'
    },
    async (username, password, done) => {
        console.log('🔍 Intentando autenticar usuario:', username);
        try {
            const user = await User.findOne({ username });
            console.log('👤 Usuario encontrado:', user ? user : 'No encontrado');
            if (!user) {
                console.log('❌ Usuario no encontrado');
                return done(null, false, { message: 'Usuario no encontrado' });
            }
            const isMatch = await user.comparePassword(password);
            console.log('🔑 Comparación de contraseña:', isMatch ? 'Coincide' : 'No coincide');
            if (!isMatch) {
                console.log('❌ Contraseña incorrecta');
                return done(null, false, { message: 'Contraseña incorrecta' });
            }
            console.log('✅ Autenticación exitosa para:', username);
            return done(null, user);
        } catch (error) {
            console.log('🚨 Error en autenticación:', error);
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    console.log('📦 Serializando usuario:', user.username);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        console.log('📥 Deserializando usuario:', user ? user.username : 'No encontrado');
        done(null, user);
    } catch (error) {
        console.log('🚨 Error en deserialización:', error);
        done(error);
    }
});

module.exports = passport;