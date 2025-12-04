import { Router } from 'express';
import { getDocentesDashboard } from '../controllers/docente.controller.js';

const router = Router();

// GET /api/docentes/dashboard
router.get('/dashboard', getDocentesDashboard);

export default router;