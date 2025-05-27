// models/ResumenMensual.js
const mongoose = require('mongoose');

const resumenMensualSchema = new mongoose.Schema({
    periodo: {
        type: String,
        required: true,
        unique: true
    },
    ventas: {
        total: {
            type: Number,
            default: 0
        },
        neto: {
            type: Number,
            default: 0
        },
        iva: {
            type: Number,
            default: 0
        }
    },
    compras: {
        total: {
            type: Number,
            default: 0
        },
        neto: {
            type: Number,
            default: 0
        },
        ivaRecuperable: {
            type: Number,
            default: 0
        }
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Índice para búsquedas por periodo
resumenMensualSchema.index({ periodo: 1 });

const ResumenMensual = mongoose.model('ResumenMensual', resumenMensualSchema);

module.exports = ResumenMensual;