// routes/index.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/indexController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Facturas = require('../models/Facturas');

router.get('/', isAuthenticated, indexController.getHomePage);

router.post('/factura/update/:id', isAuthenticated, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { pagada, metodoDePago, comentario, fechaDePago, contacto, correoContacto, sector } = req.body;
    try {
        await Facturas.updateOne(
            { _id: id },
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
            }
        );
        res.redirect('/');
    } catch (error) {
        console.error('❌ Error al actualizar factura:', error);
        res.status(500).send('Error al actualizar');
    }
});

// Nueva ruta protegida para /consulta
router.get('/consulta', isAuthenticated, (req, res) => {
    res.render('consultarFacturas');
});

module.exports = router;