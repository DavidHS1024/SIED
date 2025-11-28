import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import 'dotenv/config';

// Importar rutas
import rubricaRoutes from './routes/rubrica.routes.js';
import docenteRoutes from './routes/docente.routes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Vital para recibir JSON en POST

// Rutas API
app.use('/api/rubrica', rubricaRoutes);
app.use('/api/docentes', docenteRoutes);

// Ruta base
app.get('/', (req, res) => {
    res.send('🚀 API SIED v2.0 Online');
});

const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();