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
    fechaDePago: { type: Date, default: null }, // Nuevo campo
    fechaModificacion: { type: Date, default: null }, // Oculto, para referencia
    modificadoPor: { type: String, default: null } // Oculto, guarda el username

});


modeloBDFacturas.plugin(mongoosePaginate);
module.exports = mongoose.model('Facturas', modeloBDFacturas);