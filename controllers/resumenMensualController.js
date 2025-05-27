// controllers/resumenMensualController.js
const ResumenMensual = require('../models/ResumenMensual');
const Facturas = require('../models/Facturas');
const Compra = require('../models/Compra');

const resumenMensualController = {
    async getResumenMensual(req, res) {
        try {
            const { year, month } = req.query;
            let query = {};

            console.log('🔍 Parámetros recibidos:', { year, month });

            // Construir query de filtrado
            if (year) {
                if (month) {
                    // Filtro específico por mes y año
                    const periodo = `${year}${String(month).padStart(2, '0')}`;
                    query.periodo = periodo;
                } else {
                    // Filtro por año completo
                    query.periodo = new RegExp(`^${year}`);
                }
            }

            console.log('🔍 Query de búsqueda:', query);

            // Verificar si hay resúmenes en la base de datos
            const totalResumenes = await ResumenMensual.countDocuments();
            console.log('📊 Total de resúmenes en la base de datos:', totalResumenes);

            // Si no hay resúmenes, intentar generar uno
            if (totalResumenes === 0) {
                console.log('⚠️ No hay resúmenes en la base de datos, intentando generar...');
                await generarResumenes();
            }

            const resumenes = await ResumenMensual.find(query)
                .sort({ periodo: -1 });

            console.log('📊 Resúmenes encontrados:', resumenes.length);

            // Calcular totales generales
            const totales = resumenes.reduce((acc, resumen) => {
                // Totales de ventas
                if (resumen.ventas) {
                    acc.ventas.total += resumen.ventas.total || 0;
                    acc.ventas.neto += resumen.ventas.neto || 0;
                    acc.ventas.iva += resumen.ventas.iva || 0;
                }

                // Totales de compras
                if (resumen.compras) {
                    acc.compras.total += resumen.compras.total || 0;
                    acc.compras.neto += resumen.compras.neto || 0;
                    acc.compras.ivaRecuperable += resumen.compras.ivaRecuperable || 0;
                }

                return acc;
            }, {
                ventas: { total: 0, neto: 0, iva: 0 },
                compras: { total: 0, neto: 0, ivaRecuperable: 0 }
            });

            console.log('📊 Totales calculados:', totales);

            res.render('resumenMensual', {
                resumenes,
                totales,
                year,
                month,
                error: null
            });
        } catch (error) {
            console.error('❌ Error al obtener resumen mensual:', error);
            res.render('resumenMensual', {
                resumenes: [],
                totales: {
                    ventas: { total: 0, neto: 0, iva: 0 },
                    compras: { total: 0, neto: 0, ivaRecuperable: 0 }
                },
                error: 'Error al obtener el resumen mensual'
            });
        }
    }
};

// Función para generar resúmenes desde las facturas y compras existentes
async function generarResumenes() {
    try {
        console.log('🔄 Iniciando generación de resúmenes...');

        // Obtener todas las facturas
        const facturas = await Facturas.find({});
        console.log('📄 Total de facturas encontradas:', facturas.length);

        // Obtener todas las compras
        const compras = await Compra.find({});
        console.log('📄 Total de compras encontradas:', compras.length);

        // Agrupar facturas por periodo
        const facturasPorPeriodo = facturas.reduce((acc, factura) => {
            const fecha = new Date(factura.fechaEmision);
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const periodo = `${anio}${mes}`;
            
            if (!acc[periodo]) {
                acc[periodo] = [];
            }
            acc[periodo].push(factura);
            return acc;
        }, {});

        // Agrupar compras por periodo
        const comprasPorPeriodo = compras.reduce((acc, compra) => {
            const fecha = new Date(compra.fechaEmision);
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const anio = fecha.getFullYear();
            const periodo = `${anio}${mes}`;
            
            if (!acc[periodo]) {
                acc[periodo] = [];
            }
            acc[periodo].push(compra);
            return acc;
        }, {});

        // Procesar cada periodo
        for (const [periodo, facturas] of Object.entries(facturasPorPeriodo)) {
            const totalesVentas = facturas.reduce((acc, factura) => {
                acc.total += Number(factura.montoTotal) || 0;
                acc.neto += Number(factura.montoNeto) || 0;
                acc.iva += Number(factura.montoIVA) || 0;
                return acc;
            }, { total: 0, neto: 0, iva: 0 });

            const compras = comprasPorPeriodo[periodo] || [];
            const totalesCompras = compras.reduce((acc, compra) => {
                acc.total += Number(compra.montoTotal) || 0;
                acc.neto += Number(compra.montoNeto) || 0;
                acc.ivaRecuperable += Number(compra.montoIvaRecuperable) || 0;
                return acc;
            }, { total: 0, neto: 0, ivaRecuperable: 0 });

            // Crear o actualizar resumen
            await ResumenMensual.findOneAndUpdate(
                { periodo },
                {
                    ventas: totalesVentas,
                    compras: totalesCompras,
                    fechaActualizacion: new Date()
                },
                { upsert: true, new: true }
            );

            console.log(`✅ Resumen generado para periodo ${periodo}`);
        }

        console.log('✅ Generación de resúmenes completada');
    } catch (error) {
        console.error('❌ Error al generar resúmenes:', error);
        throw error;
    }
}

module.exports = resumenMensualController;