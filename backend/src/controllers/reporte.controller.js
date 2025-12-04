import { Docente, Usuario, EvaluacionDocente, Periodo, sequelize } from '../models/index.js';

export const getReporteGlobal = async (req, res) => {
    try {
        const periodoActivo = await Periodo.findOne({ where: { estado: 'ACTIVO' } });
        if (!periodoActivo) return res.status(404).json({ message: 'Sin periodo activo' });

        // 1. Obtener toda la data cruda
        const docentes = await Docente.findAll({
            include: [{ 
                model: EvaluacionDocente,
                where: { idPeriodo: periodoActivo.idPeriodo },
                required: false 
            }, {
                model: Usuario,
                attributes: ['nombres', 'apellidos']
            }]
        });

        // 2. Calcular Estadísticas (KPIs)
        const totalDocentes = docentes.length;
        const evaluados = docentes.filter(d => d.EvaluacionDocentes.length > 0 && d.EvaluacionDocentes[0].estado === 'FINALIZADO').length;
        const pendientes = totalDocentes - evaluados;
        
        // Conteo por Categorías
        const categorias = {
            'EXCELENTE': 0,
            'DISTINGUIDO': 0,
            'SUFICIENTE': 0,
            'DEFICIENTE': 0
        };

        const listaDetallada = docentes.map(d => {
            const evalData = d.EvaluacionDocentes[0];
            const estado = evalData ? evalData.estado : 'PENDIENTE';
            const nota = evalData ? parseFloat(evalData.puntajeFinal) : 0;
            const cat = evalData ? evalData.categoria : '-';

            if (evalData && evalData.estado === 'FINALIZADO') {
                if (categorias[cat] !== undefined) categorias[cat]++;
            }

            return {
                id: d.idDocente,
                nombre: `${d.Usuario.nombres} ${d.Usuario.apellidos}`,
                codigo: d.codigoDocente,
                estado,
                nota,
                categoria: cat
            };
        });

        res.json({
            success: true,
            periodo: periodoActivo.nombre,
            stats: {
                total: totalDocentes,
                avance: Math.round((evaluados / totalDocentes) * 100) || 0,
                pendientes,
                porCategoria: categorias
            },
            data: listaDetallada
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generando reporte' });
    }
};