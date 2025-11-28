import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Configuración para conectar a PostgreSQL en Render
export const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false, // Pon true si quieres ver cada consulta SQL en la consola
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // Necesario para que Render acepte la conexión externa
        }
    }
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión exitosa a PostgreSQL (Render) desde el Backend');
    } catch (error) {
        console.error('❌ Error de conexión:', error);
    }
};