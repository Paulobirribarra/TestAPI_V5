const mongoose = require('mongoose');

const compraSchema = new mongoose.Schema({
    // Datos básicos
    tipoDocumento: { type: Number, required: true },
    tipoDTEString: { type: String },
    tipoDTE: { type: Number, required: true },
    tipoCompra: { type: String },
    folio: { type: Number, required: true },
    fechaEmision: { type: Date, required: true },
    fechaRecepcion: { type: Date },
    fechaAcuse: { type: Date },
    
    // Datos del proveedor
    rutProveedor: { type: String, required: true },
    razonSocial: { type: String, required: true },
    
    // Montos
    montoExento: { type: Number, default: 0 },
    montoNeto: { type: Number, default: 0 },
    montoIvaRecuperable: { type: Number, default: 0 },
    montoIvaNoRecuperable: { type: Number, default: 0 },
    codigoIvaNoRecuperable: { type: Number, default: 0 },
    montoTotal: { type: Number, required: true },
    montoNetoActivoFijo: { type: Number, default: 0 },
    ivaActivoFijo: { type: Number, default: 0 },
    ivaUsoComun: { type: Number, default: 0 },
    impuestoSinDerechoCredito: { type: Number, default: 0 },
    ivaNoRetenido: { type: Number, default: 0 },
    
    // Impuestos específicos
    tabacosPuros: { type: Number, default: 0 },
    tabacosCigarrillos: { type: Number, default: 0 },
    tabacosElaborados: { type: Number, default: 0 },
    nceNdeFacturaCompra: { type: Number, default: 0 },
    valorOtroImpuesto: { type: String },
    tasaOtroImpuesto: { type: String },
    codigoOtroImpuesto: { type: Number, default: 0 },
    
    // Estado y fechas
    estado: { type: String, required: true },
    acuseRecibo: { type: String },
    fechaConsulta: { type: Date, default: Date.now }
}, { timestamps: true });

// Índices para búsquedas frecuentes
compraSchema.index({ folio: 1 });
compraSchema.index({ rutProveedor: 1 });
compraSchema.index({ razonSocial: 1 });
compraSchema.index({ fechaEmision: 1 });
compraSchema.index({ tipoDTE: 1 });
compraSchema.index({ tipoDocumento: 1 });

module.exports = mongoose.model('Compra', compraSchema); 