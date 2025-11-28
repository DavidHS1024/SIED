import { Router } from 'express';
import { getRubricaCompleta } from '../controllers/rubrica.controller.js';

const router = Router();

// Endpoint: GET /api/rubrica
router.get('/', getRubricaCompleta);

export default router;