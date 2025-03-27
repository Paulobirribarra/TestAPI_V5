// controllers/resumenMensualController.js
const ResumenMensual = require('../models/ResumenMensual');

const getResumenMensual = async (req, res) => {
    try {
        // Parámetros de paginación
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Parámetros de filtrado
        const year = req.query.year;
        const month = req.query.month;

        // Construir query de filtrado
        let query = {};
        if (year) {
            query.periodo = new RegExp(`^${year}`);
        }
        if (month) {
            query.periodo = new RegExp(`${year ? year : '\\d{4}'}${month.padStart(2, '0')}`);
        }

        // Obtener total de documentos para la paginación
        const total = await ResumenMensual.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Obtener resúmenes con paginación y filtros
        const resumenes = await ResumenMensual.find(query)
            .sort({ periodo: -1 })
            .skip(skip)
            .limit(limit);

        console.log('📢 Resumenes encontrados en MongoDB:', resumenes);
        if (!resumenes || resumenes.length === 0) {
            console.log('📢 No se encontraron resúmenes mensuales');
            return res.render('resumenMensual', {
                resumenes: [],
                groupedResumenes: {},
                yearlyTotals: {},
                yearlyComparisons: {},
                pageStyle: 'resumenMensual',
                error: 'No hay resúmenes mensuales disponibles.',
                pagination: {
                    page,
                    totalPages,
                    limit,
                    total
                },
                filters: {
                    year,
                    month
                }
            });
        }

        const meses = [
            'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
        ];

        // Agrupar resúmenes por año y formatear datos
        const groupedResumenes = {};
        const yearlyTotals = {};

        resumenes.forEach(resumen => {
            const year = resumen.periodo.slice(0, 4);
            const monthNum = parseInt(resumen.periodo.slice(4, 6), 10);
            const monthName = meses[monthNum - 1];
            const periodoFormateado = `${monthName} ${year}`;
            const ultimaActualizacionFormateada = resumen.fechaActualizacion.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Agrupar por año
            if (!groupedResumenes[year]) {
                groupedResumenes[year] = [];
                yearlyTotals[year] = {
                    totalFacturas: 0,
                    totalNotasCredito: 0,
                    montoNeto: 0,
                    count: 0 // Para calcular el promedio
                };
            }

            groupedResumenes[year].push({
                ...resumen._doc,
                periodoFormateado,
                ultimaActualizacionFormateada,
                month: monthNum
            });

            // Calcular totales anuales
            yearlyTotals[year].totalFacturas += resumen.totalFacturas;
            yearlyTotals[year].totalNotasCredito += resumen.totalNotasCredito;
            yearlyTotals[year].montoNeto += resumen.montoNeto;
            yearlyTotals[year].count += 1;
        });

        // Calcular promedios mensuales por año
        Object.keys(yearlyTotals).forEach(year => {
            yearlyTotals[year].averageMontoNeto = Math.round(yearlyTotals[year].montoNeto / yearlyTotals[year].count);
        });

        // Calcular diferencias porcentuales entre años
        const years = Object.keys(yearlyTotals).sort();
        const yearlyComparisons = {};
        for (let i = 1; i < years.length; i++) {
            const previousYear = years[i - 1];
            const currentYear = years[i];
            const previousMontoNeto = yearlyTotals[previousYear].montoNeto;
            const currentMontoNeto = yearlyTotals[currentYear].montoNeto;

            const difference = currentMontoNeto - previousMontoNeto;
            const percentageChange = previousMontoNeto !== 0
                ? Math.round((difference / previousMontoNeto) * 100)
                : null;

            yearlyComparisons[currentYear] = {
                difference,
                percentageChange
            };
        }

        // Ordenar los meses dentro de cada año
        Object.keys(groupedResumenes).forEach(year => {
            groupedResumenes[year].sort((a, b) => a.month - b.month);
        });

        res.render('resumenMensual', {
            resumenes,
            groupedResumenes,
            yearlyTotals,
            yearlyComparisons,
            pageStyle: 'resumenMensual',
            error: null,
            pagination: {
                page,
                totalPages,
                limit,
                total
            },
            filters: {
                year,
                month
            }
        });
    } catch (error) {
        console.error('❌ Error en getResumenMensual:', error.message);
        res.status(500).render('resumenMensual', {
            resumenes: [],
            groupedResumenes: {},
            yearlyTotals: {},
            yearlyComparisons: {},
            pageStyle: 'resumenMensual',
            error: 'Error al obtener el resumen mensual',
            pagination: {
                page: 1,
                totalPages: 1,
                limit: 10,
                total: 0
            },
            filters: {
                year: null,
                month: null
            }
        });
    }
};

module.exports = { getResumenMensual };