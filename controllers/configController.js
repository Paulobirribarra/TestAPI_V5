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

    console.log('📥 Datos recibidos en saveSiiConfig:', {
        rutUsuario,
        passwordSII,
        rutEmpresa,
        ambiente,
        detallado
    });

    try {
        let configSii = await ConfigUserSii.findOne();
        if (!configSii) {
            configSii = new ConfigUserSii({
                rutUsuario,
                passwordSII,
                rutEmpresa,
                ambiente: Number(ambiente),
                detallado
            });
        } else {
            configSii.rutUsuario = rutUsuario;
            configSii.passwordSII = passwordSII; // Esto disparará el hash
            configSii.rutEmpresa = rutEmpresa;
            configSii.ambiente = Number(ambiente);
            configSii.detallado = detallado;
        }
        await configSii.save(); // Esto ejecuta el pre('save')
        res.json({ success: true });
    } catch (error) {
        console.error('❌ Error detallado en saveSiiConfig:', {
            message: error.message,
            stack: error.stack,
            body: req.body
        });
        res.status(500).json({ error: 'Error al guardar configuración del SII' });
    }
};

module.exports = { getConfigPage, saveSiiConfig };