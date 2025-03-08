// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Facturas = require('../models/Facturas');
const ConfigUserSii = require('../models/configUserSii');

router.get('/', isAuthenticated, indexController.getHomePage);

router.post('/factura/update/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { pagada, metodoDePago, comentario, fechaDePago, contacto, correoContacto, sector } = req.body;
    try {
        const updatedFactura = await Facturas.findByIdAndUpdate(
            id,
            { 
                pagada: pagada === 'on', 
                metodoDePago: metodoDePago || '',
                comentario: comentario || '',
                fechaDePago: fechaDePago ? new Date(fechaDePago) : null,
                estado: pagada === 'on' ? 'Pagada' : 'Pendiente',
                fechaModificacion: new Date(),
                modificadoPor: req.user.username,
                contacto: contacto || '',
                correoContacto: correoContacto || '',
                sector: sector || ''
            },
            { new: true, runValidators: true }
        );
        if (!updatedFactura) {
            return res.status(404).send('Factura no encontrada');
        }
        res.redirect('/');
    } catch (error) {
        console.error('❌ Error al actualizar factura:', error);
        res.status(500).send('Error al actualizar');
    }
});

router.get('/consulta', isAuthenticated, isAdmin, async (req, res) => {
    const configSii = await ConfigUserSii.findOne();
    const renderData = { 
        configSiiExists: !!configSii,
        passwordSII: req.session.passwordSII || null,
        passwordSIIExpires: req.session.passwordSIIExpires || 0,
        user: req.user,
        error: null
    };
    console.log('Datos enviados a la vista:', renderData);
    res.render('consultarFacturas', renderData);
});

router.post('/consulta', isAuthenticated, isAdmin, async (req, res) => {
    const { passwordSII } = req.body;
    const configSii = await ConfigUserSii.findOne();
    if (!configSii) {
        return res.render('consultarFacturas', { 
            error: 'Configuración SII no encontrada', 
            configSiiExists: false,
            passwordSII: null,
            passwordSIIExpires: 0,
            user: req.user
        });
    }
    const isMatch = await configSii.comparePassword(passwordSII);
    console.log('🔍 Resultado de comparación de contraseña:', isMatch);
    if (isMatch) {
        req.session.passwordSII = passwordSII; // Guardar el valor plano en la sesión
        req.session.passwordSIIExpires = Date.now() + 2 * 60 * 60 * 1000; // 2 horas
        res.redirect('/consulta');
    } else {
        res.render('consultarFacturas', { 
            error: 'Contraseña SII incorrecta', 
            configSiiExists: true,
            passwordSII: null,
            passwordSIIExpires: 0,
            user: req.user
        });
    }
});

module.exports = router;