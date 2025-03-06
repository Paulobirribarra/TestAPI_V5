// controllers/indexController.js
const Facturas = require('../models/Facturas');

const getHomePage = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 28;
        const skip = (page - 1) * limit;
        const { folio, estado, contacto, mes } = req.query;

        // Filtro base para facturas (33)
        let query = { tipoDTENumber: 33 };

        if (folio) {
            const folioNum = parseInt(folio);
            if (!isNaN(folioNum)) query.folio = folioNum;
        }

        if (estado === 'pagada') {
            query.pagada = true;
        } else if (estado === 'pendiente') {
            query.pagada = false;
        }

        if (contacto) {
            query.contacto = { $regex: new RegExp(contacto, 'i') };
        }

        if (mes) {
            const mesNum = parseInt(mes);
            if (!isNaN(mesNum) && mesNum >= 1 && mesNum <= 12) {
                query.mes = mesNum;
            }
        }

        const notasDeCredito = await Facturas.find({ tipoDTENumber: 61 }, { folioDocReferencia: 1 });
        const foliosAnulados = notasDeCredito.map(nc => nc.folioDocReferencia).filter(Boolean);

        if (folio) {
            query.folio = { $eq: parseInt(folio), $nin: foliosAnulados };
        } else {
            query.folio = { $nin: foliosAnulados };
        }

        const facturas = await Facturas.find(query)
            .sort({ fechaEmision: -1 })
            .skip(skip)
            .limit(limit);

        const hoy = new Date();
        facturas.forEach(factura => {
            factura.vencida = !factura.pagada && hoy > factura.fechaVencimiento;
        });

        const totalFacturas = await Facturas.countDocuments(query);
        const totalPages = Math.ceil(totalFacturas / limit);

        // Calcular sumatoria de facturas y notas de crédito para el mes seleccionado
        const filtroMes = mes ? { mes: parseInt(mes) } : {};
        const totalFacturasMes = await Facturas.aggregate([
            { $match: { tipoDTENumber: 33, ...filtroMes } },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);
        const totalNotasCreditoMes = await Facturas.aggregate([
            { $match: { tipoDTENumber: 61, ...filtroMes } },
            { $group: { _id: null, total: { $sum: "$montoTotal" } } }
        ]);

        const montoTotalFacturas = totalFacturasMes.length > 0 ? totalFacturasMes[0].total : 0;
        const montoTotalNotasCredito = totalNotasCreditoMes.length > 0 ? totalNotasCreditoMes[0].total : 0;
        const montoNetoMes = montoTotalFacturas - montoTotalNotasCredito;

        res.render('index', {
            facturas,
            currentPage: page,
            totalPages,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            filtroFolio: folio || '',
            filtroEstado: estado || '',
            filtroContacto: contacto || '',
            filtroMes: mes || '',
            montoTotalFacturas,
            montoTotalNotasCredito,
            montoNetoMes
        });
    } catch (error) {
        console.error('❌ Error en getHomePage:', error.message);
        res.status(500).json({ error: 'Error al obtener facturas' });
    }
};

module.exports = { getHomePage };