// controllers/configController.js
const Config = require('../models/Config');
const ConfigUserSii = require('../models/configUserSii');

// controllers/configController.js
const getConfigPage = async (req, res) => {
    console.log('📢 GET /configuracion llamado');
    try {
        const configSii = await ConfigUserSii.findOne();
        const apiConfig = await Config.findOne();
        console.log('📢 apiConfig cargado:', apiConfig);
        res.render('Configuracion', { configSii, apiConfig });
    } catch (error) {
        console.error('❌ Error en getConfigPage:', error.message);
        res.status(500).send('Error al cargar la página de configuración');
    }
};

const saveSiiConfig = async (req, res) => {
    const { rutUsuario, passwordSII, rutEmpresa, ambiente, detallado } = req.body;
    console.log('📥 Datos recibidos en saveSiiConfig:', req.body);

    try {
        // Buscar si ya existe un documento con ese rutUsuario
        let configSii = await ConfigUserSii.findOne({ rutUsuario });

        if (configSii) {
            // Actualizar el documento existente
            configSii.rutUsuario = rutUsuario;
            configSii.passwordSII = passwordSII; // El hook pre('save') lo hasheará
            configSii.rutEmpresa = rutEmpresa;
            configSii.ambiente = parseInt(ambiente);
            configSii.detallado = detallado === 'true' || detallado === true;
            configSii.updatedAt = new Date();
        } else {
            // Crear un nuevo documento
            configSii = new ConfigUserSii({
                rutUsuario,
                passwordSII, // El hook pre('save') lo hasheará
                rutEmpresa,
                ambiente: parseInt(ambiente),
                detallado: detallado === 'true' || detallado === true,
                updatedAt: new Date()
            });
        }

        // Guardar el documento (esto disparará el hook pre('save'))
        try {
            await configSii.save();
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            return res.redirect('/configuracion?error=No se pudo guardar: problema en base de datos');
        }

        // Guardar el valor plano en la sesión
        req.session.passwordSII = passwordSII;
        req.session.passwordSIIExpires = Date.now() + 2 * 60 * 60 * 1000; // 2 horas

        console.log('✅ Configuración SII guardada con éxito:', configSii);
        res.redirect('/consulta');
    } catch (error) {
        console.error('❌ Error en saveSiiConfig:', error);
        res.status(500).render('Configuracion', { error: 'Error al guardar la configuración', user: req.user });
    }
};
module.exports = { getConfigPage, saveSiiConfig };