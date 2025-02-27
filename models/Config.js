// models/Config.js (sin encriptación)
const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    apiKey: { type: String, required: true },
    apiUser: { type: String, required: true },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Config', configSchema);