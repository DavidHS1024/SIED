import { sequelize, EvaluacionDocente, DetalleEvaluacion, RubricaItem, Docente, Periodo, Usuario } from '../models/index.js';

// 1. Obtener o Inicializar la Evaluación de un Docente
export const getEvaluacion = async (req, res) => {
    const { idDocente, idPeriodo } = req.params;

    try {
        // Buscamos si ya existe una carpeta de evaluación para este profe en este periodo
        let evaluacion = await EvaluacionDocente.findOne({
            where: { idDocente, idPeriodo },
            include: [{ model: DetalleEvaluacion }] // Traemos los detalles si existen
        });

        // Si no existe, devolvemos null (el frontend sabrá que está "Pendiente")
        // O podríamos crearla al vuelo, pero mejor que sea explícito.
        res.json({
            success: true,
            data: evaluacion || null
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener evaluación' });
    }
};

// 2. Guardar el Checklist de la Comisión (El Corazón del Sistema)
export const saveEvaluacionComision = async (req, res) => {
    const { idDocente, idPeriodo, detalles, idEvaluador } = req.body;
    // 'detalles' es un array: [{ idItem: 1, puntaje: 5, obs: '' }, ...]

    const t = await sequelize.transaction(); // Iniciamos transacción (si algo falla, no se guarda nada)

    try {
        // A. Buscar o Crear la Cabecera (La carpeta)
        let [evaluacion, created] = await EvaluacionDocente.findOrCreate({
            where: { idDocente, idPeriodo },
            defaults: {
                estado: 'EN_PROCESO',
                puntajeFinal: 0
            },
            transaction: t
        });

        // B. Guardar cada puntaje individual (Items 2 al 19)
        let sumaPuntajes = 0;

        for (const item of detalles) {
            // Validamos que el puntaje no exceda el máximo permitido
            const rubricaInfo = await RubricaItem.findByPk(item.idItem);
            if (rubricaInfo && item.puntaje > rubricaInfo.puntajeMaximo) {
                throw new Error(`El puntaje del ítem ${item.idItem} excede el máximo permitido (${rubricaInfo.puntajeMaximo})`);
            }

            // Buscamos si ya había una nota previa en este item para actualizarla
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
                    observacion: item.observacion,
                    evaluadoPor: idEvaluador
                }, { transaction: t });
            } else {
                await DetalleEvaluacion.create({
                    idEvaluacion: evaluacion.idEvaluacion,
                    idItem: item.idItem,
                    puntajeObtenido: item.puntaje,
                    observacion: item.observacion,
                    evaluadoPor: idEvaluador
                }, { transaction: t });
            }

            sumaPuntajes += Number(item.puntaje);
        }

        // C. Calcular Nota Final y Categoría (Regla de Negocio del PDF)
        // Nota: Aquí falta sumar la nota de la encuesta estudiantil (Item 1) si ya existiera.
        // Por ahora sumamos lo que llega de la comisión.
        
        let categoria = 'DEFICIENTE';
        if (sumaPuntajes >= 90) categoria = 'EXCELENTE';
        else if (sumaPuntajes >= 80) categoria = 'DISTINGUIDO';
        else if (sumaPuntajes >= 60) categoria = 'SUFICIENTE';

        // D. Actualizar Cabecera
        await evaluacion.update({
            puntajeFinal: sumaPuntajes,
            categoria: categoria,
            // Si es el guardado final, cambiamos estado. Por ahora lo dejamos EN_PROCESO.
            fechaCierre: new Date()
        }, { transaction: t });

        await t.commit(); // Confirmar cambios en BD

        res.json({
            success: true,
            message: 'Evaluación guardada correctamente',
            puntajeTotal: sumaPuntajes,
            categoria
        });

    } catch (error) {
        await t.rollback(); // Deshacer todo si hubo error
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: 'Error al guardar evaluación: ' + error.message 
        });
    }
};