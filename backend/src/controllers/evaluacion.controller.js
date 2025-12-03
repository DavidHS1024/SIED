import { sequelize, EvaluacionDocente, DetalleEvaluacion, RubricaItem } from '../models/index.js';

// 1. Obtener Evaluación (Sin cambios, estaba bien)
export const getEvaluacion = async (req, res) => {
    const { idDocente, idPeriodo } = req.params;
    try {
        let evaluacion = await EvaluacionDocente.findOne({
            where: { idDocente, idPeriodo },
            include: [{ model: DetalleEvaluacion }]
        });
        res.json({ success: true, data: evaluacion || null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener evaluación' });
    }
};

// 2. Guardar Checklist (CORREGIDO Y ROBUSTECIDO)
export const saveEvaluacionComision = async (req, res) => {
    const { idDocente, idPeriodo, detalles, idEvaluador } = req.body;

    // VALIDACIÓN PREVIA: Asegurar que lleguen los datos críticos
    if (!idDocente || !idPeriodo || !detalles || !Array.isArray(detalles)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Faltan datos obligatorios o el formato de "detalles" es incorrecto.' 
        });
    }

    const t = await sequelize.transaction(); 

    try {
        // A. Buscar o Crear la Cabecera (EvaluacionDocente)
        // Nota: findOrCreate devuelve un array [instancia, booleano_creado]
        let [evaluacion, created] = await EvaluacionDocente.findOrCreate({
            where: { idDocente, idPeriodo },
            defaults: {
                estado: 'EN_PROCESO',
                puntajeFinal: 0,
                categoria: 'PENDIENTE'
            },
            transaction: t
        });

        let sumaPuntajes = 0;

        // B. Procesar cada item del checklist
        for (const item of detalles) {
            // Validar que el item tenga los datos mínimos
            if (!item.idItem || item.puntaje === undefined) {
                throw new Error(`Faltan datos en uno de los detalles (idItem o puntaje).`);
            }

            // Obtener info de la Rúbrica para validar topes
            const rubricaInfo = await RubricaItem.findByPk(item.idItem);
            
            if (!rubricaInfo) {
                throw new Error(`El ítem de rúbrica con ID ${item.idItem} no existe en la base de datos.`);
            }

            if (Number(item.puntaje) > Number(rubricaInfo.puntajeMaximo)) {
                throw new Error(`El puntaje (${item.puntaje}) del ítem ${item.idItem} excede el máximo permitido (${rubricaInfo.puntajeMaximo}).`);
            }

            // Upsert manual (Buscar si existe para actualizar, sino crear)
            const detalleExistente = await DetalleEvaluacion.findOne({
                where: { 
                    idEvaluacion: evaluacion.idEvaluacion,
                    idItem: item.idItem
                },
                transaction: t
            });

            if (detalleExistente) {
                await detalleExistente.update({
                    puntajeObtenido: item.puntaje,
                    observacion: item.observacion || '',
                    evaluadoPor: idEvaluador,
                    fechaEvaluacion: new Date()
                }, { transaction: t });
            } else {
                await DetalleEvaluacion.create({
                    idEvaluacion: evaluacion.idEvaluacion,
                    idItem: item.idItem,
                    puntajeObtenido: item.puntaje,
                    observacion: item.observacion || '',
                    evaluadoPor: idEvaluador
                }, { transaction: t });
            }

            sumaPuntajes += Number(item.puntaje);
        }

        // C. Calcular Categoría
        let categoria = 'DEFICIENTE';
        if (sumaPuntajes >= 90) categoria = 'EXCELENTE';
        else if (sumaPuntajes >= 80) categoria = 'DISTINGUIDO';
        else if (sumaPuntajes >= 60) categoria = 'SUFICIENTE';

        // D. Actualizar Cabecera Final
        await evaluacion.update({
            puntajeFinal: sumaPuntajes,
            categoria: categoria,
            fechaCierre: new Date() 
            // Opcional: cambiar estado a 'FINALIZADO' si es el submit final
        }, { transaction: t });

        await t.commit(); // ¡Éxito!

        res.json({
            success: true,
            message: 'Evaluación guardada y procesada correctamente',
            data: {
                idEvaluacion: evaluacion.idEvaluacion,
                puntajeTotal: sumaPuntajes,
                categoria
            }
        });

    } catch (error) {
        await t.rollback(); // Revertir si algo falla
        console.error("Error en transacción:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Error interno del servidor al guardar evaluación.' 
        });
    }
};