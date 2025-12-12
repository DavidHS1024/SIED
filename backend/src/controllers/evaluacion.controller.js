import { sequelize, EvaluacionDocente, DetalleEvaluacion, Periodo } from '../models/index.js';

/**
 * Función auxiliar: Recalcula el puntaje total leyendo TODA la base de datos.
 * Eevita que al guardar solo 1 item se pierdan las notas de los otros.
 */

const recalcularPuntajeTotal = async (idEvaluacion, transaction) => {
    const detalles = await DetalleEvaluacion.findAll({
        where: { idEvaluacion },
        transaction
    });

    const suma = detalles.reduce((acc, item) => acc + Number(item.puntajeObtenido), 0);
    
    // Calcular categoría
    let categoria = 'DEFICIENTE';
    if (suma >= 90) categoria = 'EXCELENTE';
    else if (suma >= 80) categoria = 'DISTINGUIDO';
    else if (suma >= 60) categoria = 'SUFICIENTE';

    return { suma, categoria };
};

// GET: Obtener evaluación
export const getEvaluacion = async (req, res) => {
    const { idDocente, idPeriodo } = req.params;
    try {
        const evaluacion = await EvaluacionDocente.findOne({
            where: { idDocente, idPeriodo },
            include: [{ model: DetalleEvaluacion }]
        });
        res.json({ success: true, data: evaluacion || null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// POST: Guardado de la COMISIÓN (Cierra la evaluación)
export const saveEvaluacionComision = async (req, res) => {
    return procesarGuardado(req, res, 'FINALIZADO');
};

// POST: Guardado de la AUTOEVALUACIÓN (Mantiene en proceso)
export const saveAutoevaluacion = async (req, res) => {
    return procesarGuardado(req, res, 'EN_PROCESO');
};

// Lógica central de guardado (Reutilizable)
const procesarGuardado = async (req, res, estadoFinal) => {
    const { idDocente, idPeriodo, detalles, idEvaluador } = req.body;
    const t = await sequelize.transaction();

    try {
        // 1. Buscar o Crear Cabecera
        let [evaluacion] = await EvaluacionDocente.findOrCreate({
            where: { idDocente, idPeriodo },
            defaults: { estado: 'EN_PROCESO', puntajeFinal: 0 },
            transaction: t
        });

        const idEvaluacion = evaluacion.getDataValue('idEvaluacion') || evaluacion.id;

        // 2. Guardar/Actualizar cada detalle recibido
        for (const item of detalles) {
            const where = { idEvaluacion, idItem: item.idItem };
            const data = {
                puntajeObtenido: item.puntaje,
                observacion: item.observacion,
                evaluadoPor: idEvaluador,
                fechaEvaluacion: new Date()
            };

            const existe = await DetalleEvaluacion.findOne({ where, transaction: t });
            if (existe) {
                await existe.update(data, { transaction: t });
            } else {
                await DetalleEvaluacion.create({ ...where, ...data }, { transaction: t });
            }
        }

        // 3. MAGIA: Recalcular el total real sumando BD + Lo nuevo
        const { suma, categoria } = await recalcularPuntajeTotal(idEvaluacion, t);

        // 4. Actualizar Cabecera
        await evaluacion.update({
            puntajeFinal: suma,
            categoria: categoria,
            estado: estadoFinal, // La comisión finaliza, el docente no
            fechaCierre: estadoFinal === 'FINALIZADO' ? new Date() : null
        }, { transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Guardado correctamente',
            data: { puntajeTotal: suma, categoria, estado: estadoFinal }
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};