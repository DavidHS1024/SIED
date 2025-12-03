import { sequelize, EvaluacionDocente, DetalleEvaluacion } from '../models/index.js';

/**
 * ============================================================================
 * CONTROLADOR DE EVALUACIÓN DOCENTE
 * Gestión de auditorías, cálculos de puntaje y persistencia transaccional.
 * ============================================================================
 */

/**
 * Obtiene el estado actual de una evaluación.
 * Endpoint: GET /api/evaluacion/:idDocente/:idPeriodo
 */
export const getEvaluacion = async (req, res) => {
    const { idDocente, idPeriodo } = req.params;

    try {
        // Buscamos la cabecera con sus detalles anidados (Eager Loading)
        const evaluacion = await EvaluacionDocente.findOne({
            where: { idDocente, idPeriodo },
            include: [{ model: DetalleEvaluacion }]
        });

        return res.json({
            success: true,
            data: evaluacion || null // Retorna null si aún no existe auditoría
        });

    } catch (error) {
        console.error("[EvaluacionController] Error al obtener registro:", error);
        return res.status(500).json({ 
            success: false, 
            message: 'Error interno al consultar la evaluación.' 
        });
    }
};

/**
 * Guarda o actualiza la auditoría de la Comisión (Checklist).
 * Utiliza transacciones para asegurar la integridad de los datos (ACID).
 * Endpoint: POST /api/evaluacion
 */
export const saveEvaluacionComision = async (req, res) => {
    // 1. Validación de Payload (Fail Fast)
    const { idDocente, idPeriodo, detalles, idEvaluador } = req.body;

    if (!idDocente || !idPeriodo || !Array.isArray(detalles)) {
        console.warn("[EvaluacionController] Payload inválido recibido:", req.body);
        return res.status(400).json({ 
            success: false, 
            message: 'Datos incompletos. Se requiere idDocente, idPeriodo y un array de detalles.' 
        });
    }

    // 2. Iniciar Transacción (Si falla un insert, se revierte todo)
    const t = await sequelize.transaction();

    try {
        console.log(`[EvaluacionController] Iniciando proceso para Docente ID: ${idDocente}`);

        // A. Gestión de la Cabecera (Header) - Patrón Singleton por periodo/docente
        // findOrCreate devuelve un array: [instancia, boleano_creado]
        let [evaluacionHeader, created] = await EvaluacionDocente.findOrCreate({
            where: { idDocente, idPeriodo },
            defaults: {
                estado: 'EN_PROCESO',
                puntajeFinal: 0,
                fechaEvaluacion: new Date()
            },
            transaction: t
        });

        // Obtener ID de forma segura (compatible si la PK es 'id' o 'idEvaluacion')
        const headerId = evaluacionHeader.getDataValue('idEvaluacion') || evaluacionHeader.id;

        if (!headerId) throw new Error("No se pudo recuperar el ID de la cabecera de evaluación.");

        // B. Procesamiento de Detalles (Batch Processing)
        let sumaPuntajes = 0;

        for (const item of detalles) {
            // Saneamiento básico de entrada
            const puntaje = Number(item.puntaje) || 0;
            const observacion = item.observacion || '';

            // Upsert: Busca si existe el detalle para ese item, si no, lo crea.
            const detalleExistente = await DetalleEvaluacion.findOne({
                where: { 
                    idEvaluacion: headerId, 
                    idItem: item.idItem 
                },
                transaction: t
            });

            if (detalleExistente) {
                await detalleExistente.update({
                    puntajeObtenido: puntaje,
                    observacion: observacion,
                    evaluadoPor: idEvaluador
                }, { transaction: t });
            } else {
                await DetalleEvaluacion.create({
                    idEvaluacion: headerId,
                    idItem: item.idItem,
                    puntajeObtenido: puntaje,
                    observacion: observacion,
                    evaluadoPor: idEvaluador
                }, { transaction: t });
            }

            sumaPuntajes += puntaje;
        }

        // C. Regla de Negocio: Categorización (Según reglamento UNAC)
        let categoria = 'DEFICIENTE'; // Default
        if (sumaPuntajes >= 90) categoria = 'EXCELENTE';
        else if (sumaPuntajes >= 80) categoria = 'DISTINGUIDO';
        else if (sumaPuntajes >= 60) categoria = 'SUFICIENTE';

        // D. Actualización Final de Cabecera
        await evaluacionHeader.update({
            puntajeFinal: sumaPuntajes,
            categoria: categoria,
            estado: 'AUDITADO', 
            fechaCierre: new Date() // Timestamp de auditoría
        }, { transaction: t });

        // 3. Commit de la Transacción
        await t.commit();
        console.log(`[EvaluacionController] Éxito. Nota Final: ${sumaPuntajes}, Categoría: ${categoria}`);

        return res.json({
            success: true,
            message: 'Evaluación guardada correctamente.',
            data: {
                idEvaluacion: headerId,
                puntajeTotal: sumaPuntajes,
                categoria
            }
        });

    } catch (error) {
        // 4. Rollback en caso de error (Deshacer cambios en BD)
        await t.rollback();
        console.error("[EvaluacionController] Transacción fallida:", error);
        
        return res.status(500).json({ 
            success: false, 
            message: `Error al procesar la evaluación: ${error.message}` 
        });
    }
};