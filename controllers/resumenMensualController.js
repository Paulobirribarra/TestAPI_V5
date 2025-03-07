// controllers/resumenMensualController.js
const ResumenMensual = require('../models/ResumenMensual');

const getResumenMensual = async (req, res) => {
    try {
        const resumenes = await ResumenMensual.find().sort({ periodo: -1 });
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        const resumenesFormateados = resumenes.map(resumen => {
            const year = resumen.periodo.slice(0, 4);
            const monthNum = parseInt(resumen.periodo.slice(4, 6), 10);
            const monthName = meses[monthNum - 1];
            const periodoFormateado = `${monthName} ${year}`;
            const ultimaActualizacionFormateada = resumen.fechaActualizacion.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

            return {
                ...resumen._doc,
                periodoFormateado,
                ultimaActualizacionFormateada
            };
        });

        res.render('resumenMensual', { resumenes: resumenesFormateados, pageStyle: 'resumenMensual' });
    } catch (error) {
        console.error('❌ Error en getResumenMensual:', error.message);
        res.status(500).json({ error: 'Error al obtener el resumen mensual' });
    }
};

module.exports = { getResumenMensual };