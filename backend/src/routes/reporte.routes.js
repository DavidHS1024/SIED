import { Router } from 'express';
import { getReporteGlobal } from '../controllers/reporte.controller.js';

const router = Router();

router.get('/global', getReporteGlobal);

export default router;