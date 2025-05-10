const mongoose = require('mongoose');

const modeloBDResumenMensualCompras = new mongoose.Schema({
    periodo: { type: String, required: true, unique: true }, // Ej. "202408" para agosto 2024
    totalFacturas: { type: Number, default: 0 }, // Suma de montoTotal de tipo 33
    totalNotasCredito: { type: Number, default: 0 }, // Suma de montoTotal de tipo 61
    montoNeto: { type: Number, default: 0 }, // totalFacturas - totalNotasCredito
    fechaActualizacion: { type: Date, default: Date.now },
    foliosProcesados: [{ // Array de folios ya procesados en este período
        folio: Number,
        tipoDTE: Number,
        montoTotal: Number,
        fechaProcesamiento: Date
    }]
}, { collection: 'resumenMensualCompras' });

module.exports = mongoose.model('ResumenMensualCompras', modeloBDResumenMensualCompras); 