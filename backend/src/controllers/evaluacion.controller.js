import { sequelize, EvaluacionDocente, DetalleEvaluacion } from '../models/index.js';

/**
 * CONTROLADOR DE EVALUACIÓN DOCENTE (Corregido)
 * Alineado con Enum Database: 'EN_PROCESO' | 'FINALIZADO'
 */

export const getEvaluacion = async (req, res) => {
    const { idDocente, idPeriodo } = req.params;
    try {
        const evaluacion = await EvaluacionDocente.findOne({
            where: { idDocente, idPeriodo },
            include: [{ model: DetalleEvaluacion }]
        });
        res.json({ success: true, data: evaluacion || null });
    } catch (error) {
        console.error("[EvaluacionController] Error:", error);
        res.status(500).json({ message: 'Error al obtener evaluación' });
    }
};

export const saveEvaluacionComision = async (req, res) => {
    const { idDocente, idPeriodo, detalles, idEvaluador } = req.body;

    if (!idDocente || !idPeriodo || !Array.isArray(detalles)) {
        return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    const t = await sequelize.transaction();

    try {
        console.log(`[Evaluacion] Procesando Docente ID: ${idDocente} - Periodo: ${idPeriodo}`);

        // 1. Buscar/Crear Cabecera
        let [evaluacionHeader, created] = await EvaluacionDocente.findOrCreate({
            where: { idDocente, idPeriodo },
            defaults: {
                estado: 'EN_PROCESO',
                puntajeFinal: 0
            },
            transaction: t
        });

        const headerId = evaluacionHeader.getDataValue('idEvaluacion') || evaluacionHeader.id;

        // 2. Guardar Detalles
        let sumaPuntajes = 0;
        for (const item of detalles) {
            const puntaje = Number(item.puntaje) || 0;
            
            // Upsert del detalle
            const detalleExistente = await DetalleEvaluacion.findOne({
                where: { idEvaluacion: headerId, idItem: item.idItem },
                transaction: t
            });

            if (detalleExistente) {
                await detalleExistente.update({
                    puntajeObtenido: puntaje,
                    observacion: item.observacion || '',
                    evaluadoPor: idEvaluador,
                    fechaEvaluacion: new Date()
                }, { transaction: t });
            } else {
                await DetalleEvaluacion.create({
                    idEvaluacion: headerId,
                    idItem: item.idItem,
                    puntajeObtenido: puntaje,
                    observacion: item.observacion || '',
                    evaluadoPor: idEvaluador,
                    fechaEvaluacion: new Date()
                }, { transaction: t });
            }
            sumaPuntajes += puntaje;
        }

        // 3. Calcular Categoría
        let categoria = 'DEFICIENTE';
        if (sumaPuntajes >= 90) categoria = 'EXCELENTE';
        else if (sumaPuntajes >= 80) categoria = 'DISTINGUIDO';
        else if (sumaPuntajes >= 60) categoria = 'SUFICIENTE';

        // 4. Actualizar Cabecera (Estado FINALIZADO)
        // AQUI ESTABA EL ERROR: Cambiamos 'AUDITADO' por 'FINALIZADO'
        await evaluacionHeader.update({
            puntajeFinal: sumaPuntajes,
            categoria: categoria,
            estado: 'FINALIZADO', 
            fechaCierre: new Date()
        }, { transaction: t });

        await t.commit();
        console.log(`[Evaluacion] Guardado Exitoso. Estado: FINALIZADO. Nota: ${sumaPuntajes}`);

        res.json({
            success: true,
            message: 'Evaluación guardada correctamente',
            data: { puntajeTotal: sumaPuntajes, categoria }
        });

    } catch (error) {
        await t.rollback();
        console.error("[Evaluacion] Error Transaction:", error.message);
        // Devolvemos el error exacto para que el frontend sepa qué pasó
        res.status(500).json({ success: false, message: `Error BD: ${error.message}` });
    }
};