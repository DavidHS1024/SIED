import { Sequelize } from 'sequelize';
import 'dotenv/config';

// Configuración para conectar a PostgreSQL en Render
export const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
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