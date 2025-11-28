import { Router } from 'express';
import { getEvaluacion, saveEvaluacionComision } from '../controllers/evaluacion.controller.js';

const router = Router();

// GET /api/evaluacion/:idDocente/:idPeriodo
// Para ver cómo va la evaluación de un profe
router.get('/:idDocente/:idPeriodo', getEvaluacion);

// POST /api/evaluacion
// Para guardar el checklist
router.post('/', saveEvaluacionComision);

export default router;