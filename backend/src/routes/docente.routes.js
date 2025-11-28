import { Router } from 'express';
import { getDocentes, createDocente } from '../controllers/docente.controller.js';

const router = Router();

router.get('/', getDocentes);
router.post('/', createDocente);

export default router;