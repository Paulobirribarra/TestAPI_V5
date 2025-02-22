const mongoose = require('mongoose');

const modeloBDFacturas = new mongoose.Schema({
    folio: Number,
    razonSocial: String,
    rutCliente: String,
    tipoDTENumber: Number,
    tipoDTEString: String,
    folioDocReferencia: String,
    fechaEmision: Date,
    estado: String,
    montoNeto: Number,
    montoIVA: Number,
    montoTotal: Number,
    montoIVARecuperable: Number,
    idInterno: String,
    dia: Number,
    mes: Number,
    anio: Number,
    pagada: {type: Boolean, default: false},
    fechaDePago: Date,
    metodoDePago: String,
    comentario: String,
    numeroDeOperacion: Number
});

module.exports = mongoose.model('Facturas', modeloBDFacturas);