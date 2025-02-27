//routes/Config.js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('configuracion');
});

module.exports = router;