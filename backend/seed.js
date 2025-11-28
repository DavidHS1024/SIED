import { sequelize, connectDB } from './src/config/database.js';
import { Usuario, Periodo } from './src/models/index.js'; // Usamos el index que acabamos de crear
import bcrypt from 'bcrypt';

const seed = async () => {
    try {
        // 1. Conectar
        await connectDB();

        // 2. Sincronizar (Sin borrar tablas, solo verificar)
        await sequelize.sync({ alter: false });

        // 3. Crear Usuario ADMIN
        // Verificamos si ya existe para no duplicar error
        const adminExiste = await Usuario.findOne({ where: { email: 'admin@unac.edu.pe' } });
        
        if (!adminExiste) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            await Usuario.create({
                email: 'admin@unac.edu.pe',
                passwordHash: passwordHash,
                nombres: 'Super',
                apellidos: 'Administrador',
                rol: 'ADMIN',
                estado: true
            });
            console.log('✅ Usuario ADMIN creado (User: admin@unac.edu.pe / Pass: admin123)');
        } else {
            console.log('ℹ️ El usuario ADMIN ya existe.');
        }

        // 4. Crear Periodo de Prueba
        const periodoExiste = await Periodo.findOne({ where: { nombre: '2025-A' } });
        if (!periodoExiste) {
            await Periodo.create({
                nombre: '2025-A',
                fechaInicio: '2025-03-01',
                fechaFin: '2025-07-31',
                estado: 'PLANIFICACION'
            });
            console.log('✅ Periodo 2025-A creado.');
        } else {
            console.log('ℹ️ El periodo 2025-A ya existe.');
        }

    } catch (error) {
        console.error('❌ Error en el seed:', error);
    } finally {
        // Cerrar conexión
        await sequelize.close();
    }
};

seed();