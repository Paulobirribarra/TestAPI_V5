// models/Facturas.js
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
    fechaVencimiento: { type: Date, default: null },
    contacto: { type: String, default: '' },
    correoContacto: { type: String, default: '' },
    sector: { type: String, default: '' },
    tipoVenta: { type: String, default: '' },
    fechaRecepcion: { type: Date, default: null },
    montoExento: { type: Number, default: 0 },
    codigoOtroImpuesto: { type: Number, default: 0 },
    totalOtrosImpuestos: { type: Number, default: 0 },
    ivaRetenidoTotal: { type: Number, default: 0 },
    ivaRetenidoParcial: { type: Number, default: 0 },
    ivaNoRetenido: { type: Number, default: 0 },
    ivaPropio: { type: Number, default: 0 },
    ivaTerceros: { type: Number, default: 0 },
    rutEmisorLiqFactura: { type: String, default: '-' },
    netoComisionLiqFactura: { type: Number, default: 0 },
    exentoComisionLiqFactura: { type: Number, default: 0 },
    ivaComisionLiqFactura: { type: Number, default: 0 },
    ivaFueraPlazo: { type: Number, default: 0 },
    creditoEmpresaConstructora: { type: Number, default: 0 },
    garantiaDepEnvases: { type: Number, default: 0 },
    numeroInterno: { type: String, default: '' },
    nceNdeFacturaCompra: { type: String, default: '' },
    montoNoFacturable: { type: Number, default: 0 },
    indicadorVentaSinCosto: { type: Number, default: 0 },
    indicadorServicioPeriodico: { type: Number, default: 0 },
    periodo: { type: String, required: true }, // Campo añadido
});

// Agregar índice compuesto único para folio y tipoDTENumber
modeloBDFacturas.index({ folio: 1, tipoDTENumber: 1 }, { unique: true });

modeloBDFacturas.plugin(mongoosePaginate);
module.exports = mongoose.model('Facturas', modeloBDFacturas);