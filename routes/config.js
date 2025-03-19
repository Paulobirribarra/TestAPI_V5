// routes/config.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Config = require('../models/Config');

router.get('/', isAuthenticated, isAdmin, configController.getConfigPage);

router.post('/sii', isAuthenticated, isAdmin, (req, res) => {
    console.log('📡 POST /config/sii recibido con body:', req.body);
    configController.saveSiiConfig(req, res).then(() => {
        console.log('✅ POST /config/sii procesado exitosamente');
    }).catch(err => {
        console.error('❌ Error en POST /config/sii:', err);
    });
});

router.post('/api', isAuthenticated, isAdmin, async (req, res) => {
    console.log('📥 Solicitud POST /config/api recibida con datos:', req.body);
    const { apiUser, apiKey } = req.body;
    try {
        let configApi = await Config.findOne();
        if (configApi) {
            configApi.apiUser = apiUser;
            configApi.apiKey = apiKey;
            configApi.updatedAt = new Date();
        } else {
            configApi = new Config({
                apiUser,
                apiKey,
                updatedAt: new Date()
            });
        }
        await configApi.save();
        console.log('✅ Configuración API guardada con éxito:', configApi);
        res.status(200).json({ success: true }); // Asegurarse de devolver JSON
    } catch (error) {
        console.error('❌ Error al guardar Configuración API:', error);
        res.status(500).json({ error: 'Error al guardar la configuración API' });
    }
});

module.exports = router;