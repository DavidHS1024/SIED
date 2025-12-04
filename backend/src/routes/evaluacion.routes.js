import { Router } from 'express';
import { getEvaluacion, saveEvaluacionComision, saveAutoevaluacion } from '../controllers/evaluacion.controller.js';

const router = Router();

// Para ver cómo va la evaluación de un profe
router.get('/:idDocente/:idPeriodo', getEvaluacion);

// Para guardar el checklist
router.post('/', saveEvaluacionComision);

// Ruta para el Docente (Solo guarda, no cierra)
router.post('/auto', saveAutoevaluacion);

// Ruta para la Comisión (Cierra el proceso)
router.post('/', saveEvaluacionComision);

export default router;