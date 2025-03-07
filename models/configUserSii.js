// models/configUserSii.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const configUserSiiSchema = new mongoose.Schema({
    rutUsuario: { type: String, required: true },
    passwordSII: { type: String, required: true },
    rutEmpresa: { type: String, required: true },
    ambiente: { type: Number, required: true, enum: [0, 1] },
    detallado: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now }
}, { collection: 'configUserSii' });

configUserSiiSchema.pre('save', async function (next) {
    if (!this.isModified('passwordSII')) return next();
    const salt = await bcrypt.genSalt(10);
    this.passwordSII = await bcrypt.hash(this.passwordSII, salt);
    next();
});

configUserSiiSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.passwordSII);
};

module.exports = mongoose.model('ConfigUserSii', configUserSiiSchema);