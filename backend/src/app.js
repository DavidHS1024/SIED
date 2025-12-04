import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import 'dotenv/config';
import reporteRoutes from './routes/reporte.routes.js';

// --- IMPORTAR RUTAS ---
import rubricaRoutes from './routes/rubrica.routes.js';
import docenteRoutes from './routes/docente.routes.js';
import evaluacionRoutes from './routes/evaluacion.routes.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// --- USAR RUTAS ---
app.use('/api/rubrica', rubricaRoutes);
app.use('/api/docentes', docenteRoutes);
app.use('/api/evaluacion', evaluacionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/reportes', reporteRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.send('🚀 API SIED v2.0 Online - Ready for Scrum');
});

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();