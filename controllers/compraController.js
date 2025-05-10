const { fetchCompras, saveCompras, updateResumenMensualCompras } = require('../services/compraService');
const ConfigUserSii = require('../models/configUserSii');
const Config = require('../models/Config');
const Compras = require('../models/Compras');

const getCompras = async (req, res) => {
    try {
        console.log('🟢 Recibida consulta de compras con parámetros:', req.query);
        const config = await Config.findOne();
        const { fecha, mes, anio } = req.query;
        const passwordSII = req.session.passwordSII;

        if (!passwordSII) {
            return res.redirect('/consulta');
        }

        const params = {};
        if (fecha) {
            params.fecha = fecha;
        } else if (mes && anio) {
            params.mes = mes;
            params.anio = anio;
        } else {
            throw new Error('Parámetros de consulta inválidos');
        }

        const compras = await fetchCompras(params, config, passwordSII);
        const saveResult = await saveCompras(compras.compras);

        let periodo;
        if (fecha) {
            const [anioFecha, mesFecha] = fecha.split('-');
            periodo = `${anioFecha}${mesFecha}`;
        } else if (mes && anio) {
            periodo = `${anio}${mes.padStart(2, '0')}`;
        }

        // Actualizar el resumen mensual de compras con las compras procesadas
        await updateResumenMensualCompras(periodo, compras.compras);

        res.json({
            consultaRealizada: true,
            totalCompras: compras.compras.length,
            compras: compras.compras.map(c => ({
                ...c,
                fecha: c.fechaEmision // ya está en formato chileno
            })),
            resumenes: compras.resumenes,
            caratula: compras.caratula,
            saveResult
        });
    } catch (error) {
        console.error('❌ Error en getCompras:', error.message);
        res.status(500).json({
            error: error.message,
            consultaRealizada: false
        });
    }
};

// Nuevo método para renderizar el listado de compras
const renderComprasListado = async (req, res) => {
    try {
        const compras = await Compras.find().sort({ fecha: -1 });
        res.render('comprasListado', { compras });
    } catch (error) {
        console.error('❌ Error al obtener compras:', error.message);
        res.render('comprasListado', { compras: [] });
    }
};

module.exports = {
    getCompras,
    getComprasApi: getCompras,
    renderComprasListado
}; 