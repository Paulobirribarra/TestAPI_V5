const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const modeloBDCompras = new mongoose.Schema({
    // Campos de caratula
    rutEmpresa: String,
    nombreMes: String,
    mes: Number,
    anio: Number,
    dia: Number,
    periodo: String,

    // Campos de detalle de compra
    tipoDTEString: String,
    tipoDTE: Number,
    tipoCompra: String,
    rutProveedor: String,
    razonSocial: String,
    folio: Number,
    fechaEmision: Date,
    fechaRecepcion: Date,
    acuseRecibo: String,
    montoExento: Number,
    montoNeto: Number,
    montoIvaRecuperable: Number,
    montoIvaNoRecuperable: Number,
    codigoIvaNoRecuperable: Number,
    montoTotal: Number,
    montoNetoActivoFijo: Number,
    ivaActivoFijo: Number,
    ivaUsoComun: Number,
    impuestoSinDerechoCredito: Number,
    ivaNoRetenido: Number,
    tabacosPuros: Number,
    tabacosCigarrillos: Number,
    tabacosElaborados: Number,
    nceNdeFacturaCompra: Number,
    valorOtroImpuesto: String,
    tasaOtroImpuesto: String,
    codigoOtroImpuesto: Number,
    estado: String,
    fechaAcuse: Date,
    otrosImpuestos: [{
        valor: String,
        tasa: String,
        codigo: Number
    }],

    // Campos adicionales para control interno
    pagada: { type: Boolean, default: false },
    metodoDePago: { type: String, default: '' },
    comentario: { type: String, default: '' },
    fechaModificacion: { type: Date, default: null },
    modificadoPor: { type: String, default: null }
});

// Agregar índice compuesto único para folio y tipoDTE
modeloBDCompras.index({ folio: 1, tipoDTE: 1 }, { unique: true });

// Agregar plugin de paginación
modeloBDCompras.plugin(mongoosePaginate);

// Al guardar o retornar una compra, asegurar que el campo de fecha esté en formato DD/MM/AAAA
const formatFechaChilena = (fecha) => {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
};

module.exports = mongoose.model('Compras', modeloBDCompras); 