// config/database.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://localhost:27017/facturasDB';

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState === 1) {
            console.log('✅ Ya existe una conexión a MongoDB');
            return;
        }

        await mongoose.connect(MONGO_URI);
        console.log('✅ Conectado a MongoDB');
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;