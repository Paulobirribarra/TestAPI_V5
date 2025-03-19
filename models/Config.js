// models/Config.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const configSchema = new mongoose.Schema({
    apiKey: { type: String, required: true },
    apiUser: { type: String, required: true },
    sessionSecret: { type: String, required: true, default: () => crypto.randomBytes(32).toString('hex') },
    updatedAt: { type: Date, default: Date.now }
});

configSchema.pre('save', function(next) {
    console.log('📋 pre-save hook para Config - datos:', this.toObject());
    next();
});

module.exports = mongoose.model('Config', configSchema);