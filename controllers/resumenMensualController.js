// controllers/resumenMensualController.js
const ResumenMensual = require('../models/ResumenMensual');

const getResumenMensual = async (req, res) => {
    try {
        const resumenes = await ResumenMensual.find().sort({ periodo: -1 });

        // Nombres de los meses en español
        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Formatear los datos
        const resumenesFormateados = resumenes.map(resumen => {
            // Formatear el periodo (ej. "202407" -> "Julio 2024")
            const year = resumen.periodo.slice(0, 4);
            const monthNum = parseInt(resumen.periodo.slice(4, 6), 10);
            const monthName = meses[monthNum - 1]; // Los meses comienzan en 1
            const periodoFormateado = `${monthName} ${year}`;

            // Formatear la fecha de última actualización (ej. "Thu Mar 06 2025" -> "6 de marzo de 2025")
            const opcionesFecha = { year: 'numeric', month: 'long', day: 'numeric' };
            const ultimaActualizacionFormateada = resumen.fechaActualizacion.toLocaleDateString('es-ES', opcionesFecha);

            return {
                ...resumen._doc, // Copia todos los campos originales
                periodoFormateado,
                ultimaActualizacionFormateada
            };
        });

        res.render('resumenMensual', { resumenes: resumenesFormateados });
    } catch (error) {
        console.error('❌ Error en getResumenMensual:', error.message);
        res.status(500).json({ error: 'Error al obtener el resumen mensual' });
    }
};

module.exports = { getResumenMensual };