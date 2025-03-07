// controllers/configController.js
const Config = require('../models/Config');
const ConfigUserSii = require('../models/configUserSii');

const getConfigPage = async (req, res) => {
    try {
        const configSii = await ConfigUserSii.findOne();
        res.render('Configuracion', { configSii });
    } catch (error) {
        console.error('❌ Error en getConfigPage:', error.message);
        res.status(500).send('Error al cargar la página de configuración');
    }
};

const saveSiiConfig = async (req, res) => {
    const { rutUsuario, passwordSII, rutEmpresa, ambiente, detallado } = req.body;
    console.log('📥 Datos recibidos en saveSiiConfig:', req.body);

    try {
        const configSii = await ConfigUserSii.findOneAndUpdate(
            { rutUsuario }, // Buscar por rutUsuario para actualizar o crear
            { 
                rutUsuario, 
                passwordSII, // Esto será hasheado por el modelo
                rutEmpresa, 
                ambiente: parseInt(ambiente), 
                detallado: detallado === 'true' || detallado === true,
                updatedAt: new Date()
            },
            { upsert: true, new: true, runValidators: true }
        );

        // Guardar el valor plano en la sesión
        req.session.passwordSII = passwordSII;
        req.session.passwordSIIExpires = Date.now() + 2 * 60 * 60 * 1000; // 2 horas

        res.redirect('/consulta'); // Redirigir a la página de consulta
    } catch (error) {
        console.error('❌ Error en saveSiiConfig:', error);
        res.status(500).render('Configuracion', { error: 'Error al guardar la configuración', user: req.user });
    }
};
module.exports = { getConfigPage, saveSiiConfig };