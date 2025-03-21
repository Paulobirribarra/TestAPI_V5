//controllers/configControllers
const Config = require('../models/Config');
const ConfigUserSii = require('../models/configUserSii');

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

    // Validar RUTs (formato chileno: 12345678-9)
    const rutRegex = /^\d{1,8}-[\dkK]$/;
    if (!rutRegex.test(rutUsuario) || !rutRegex.test(rutEmpresa)) {
        return res.status(400).render('Configuracion', { error: 'RUTs inválidos. Usa formato 12345678-9.', user: req.user });
    }

    // Validar passwordSII (alfanuméricos y caracteres especiales básicos, 6-20 caracteres)
    const passwordRegex = /^[\w@#\$%^&*]{6,20}$/;
    if (!passwordRegex.test(passwordSII)) {
        return res.status(400).render('Configuracion', { error: 'Contraseña SII inválida. Usa 6-20 caracteres alfanuméricos y @#$%^&*.', user: req.user });
    }

    // Validar ambiente
    if (![0, 1].includes(parseInt(ambiente))) {
        return res.status(400).render('Configuracion', { error: 'Ambiente debe ser 0 o 1.', user: req.user });
    }

    try {
        let configSii = await ConfigUserSii.findOne({ rutUsuario });
        if (configSii) {
            configSii.rutUsuario = rutUsuario;
            configSii.passwordSII = passwordSII; // Hook lo hashea
            configSii.rutEmpresa = rutEmpresa;
            configSii.ambiente = parseInt(ambiente);
            configSii.detallado = detallado === 'true' || detallado === true;
            configSii.updatedAt = new Date();
        } else {
            configSii = new ConfigUserSii({
                rutUsuario,
                passwordSII,
                rutEmpresa,
                ambiente: parseInt(ambiente),
                detallado: detallado === 'true' || detallado === true,
                updatedAt: new Date()
            });
        }

        await configSii.save();
        req.session.passwordSII = passwordSII;
        req.session.passwordSIIExpires = Date.now() + 30 * 60 * 1000; // password sii se solicita cada 30 minutos
        console.log('✅ Configuración SII guardada con éxito:', configSii);
        res.redirect('/consulta');
    } catch (error) {
        console.error('❌ Error en saveSiiConfig:', error);
        res.status(500).render('Configuracion', { error: 'Error al guardar la configuración', user: req.user });
    }
};

module.exports = { getConfigPage, saveSiiConfig };