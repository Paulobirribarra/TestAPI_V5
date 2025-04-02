const cors = require('cors');

const corsOptions = {
    origin: false, // Deshabilitar CORS en desarrollo
    credentials: true
};

module.exports = cors(corsOptions); 