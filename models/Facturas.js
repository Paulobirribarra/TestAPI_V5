const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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
    pagada: { type: Boolean, default: false },
    metodoDePago: { type: String, default: '' },
    comentario: { type: String, default: '' },
    pagadaAutomaticamente: { type: Boolean, default: false },
    numeroDeOperacion: { type: String, default: '' },
    tipoDocReferencia: { type: Number, default: 0 },
    fechaDePago: { type: Date, default: null },
    fechaModificacion: { type: Date, default: null },
    modificadoPor: { type: String, default: null },
    // Nuevos campos
    fechaVencimiento: { type: Date, default: null }, // Calculada como fechaEmision + 30 días
    contacto: { type: String, default: '' }, // Nombre del contacto, ej: "Angelica Valenzuela"
    correoContacto: { type: String, default: '' }, // Correo del contacto
    sector: { type: String, default: '' } // Sector del contacto
});

modeloBDFacturas.plugin(mongoosePaginate);
module.exports = mongoose.model('Facturas', modeloBDFacturas);