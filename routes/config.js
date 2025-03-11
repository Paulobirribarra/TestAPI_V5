// routes/config.js
const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const Config = require('../models/Config');

// Cambiar '/configuracion' a '/'
router.get('/', isAuthenticated, isAdmin, configController.getConfigPage);
router.post('/sii', isAuthenticated, isAdmin, configController.saveSiiConfig);

router.post('/api', isAuthenticated, isAdmin, async (req, res) => {
    const { apiUser, apiKey } = req.body;
    console.log('📥 Datos recibidos en saveApiConfig:', req.body);
    try {
        let configApi = await Config.findOne();
        if (configApi) {
            configApi.apiUser = apiUser;
            configApi.apiKey = apiKey;
            configApi.updatedAt = new Date();
        } else {
            configApi = new Config({
                type: 'api',
                apiUser,
                apiKey,
                updatedAt: new Date()
            });
        }
        await configApi.save();
        console.log('✅ Configuración API guardada con éxito:', configApi);
        res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Error al guardar Configuración API:', error);
        res.status(500).json({ error: 'Error al guardar la configuración API' });
    }
});

module.exports = router;