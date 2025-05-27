const Compra = require('../models/Compra');

const comprasController = {
    async getFacturasCompras(req, res) {
        try {
            const { mes, anio } = req.query;
            console.log('🟢 Consultando facturas de compras con parámetros:', { mes, anio });

            // Construir el filtro
            const filtro = { tipoDTE: 33 }; // Solo facturas (tipoDTE 33)

            // Si se proporciona mes y año, agregar al filtro
            if (mes && anio) {
                const fechaInicio = new Date(anio, mes - 1, 1);
                const fechaFin = new Date(anio, mes, 0);
                filtro.fechaEmision = {
                    $gte: fechaInicio,
                    $lte: fechaFin
                };
            }

            // Consultar las facturas de compras
            const facturas = await Compra.find(filtro)
                .sort({ fechaEmision: -1 });

            console.log(`📄 Se encontraron ${facturas.length} facturas de compras`);

            res.render('facturasCompras', {
                facturas,
                mes,
                anio
            });
        } catch (error) {
            console.error('❌ Error al obtener facturas de compras:', error);
            res.status(500).render('error', {
                error: 'Error al obtener las facturas de compras'
            });
        }
    }
};

module.exports = comprasController; 