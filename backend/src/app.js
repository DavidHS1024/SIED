import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import 'dotenv/config';

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('🚀 API del Sistema SIED v2.0 funcionando');
});

// Iniciar servidor
const startServer = async () => {
    await connectDB(); // Intentar conectar a la BD primero
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();
