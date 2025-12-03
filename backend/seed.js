import { sequelize, connectDB } from './src/config/database.js';
import { Usuario, Periodo, Docente, Dimension, RubricaItem } from './src/models/index.js'; 
import bcrypt from 'bcrypt';

/**
 * SEEDER DE DATOS INICIALES (SIED v2.0)
 * Corrige errores de integridad en RubricaItem y Docente.
 */
const seed = async () => {
    try {
        console.log('🌱 Iniciando Seed...');
        
        // 1. Conectar y Limpiar BD
        await connectDB();
        await sequelize.sync({ force: true }); // Borra y crea tablas desde cero
        console.log('✅ Base de datos reseteada y sincronizada.');

        // 2. Crear USUARIOS
        const passwordHash = await bcrypt.hash('123456', 10);

        // A. Usuario ADMIN
        await Usuario.create({
            idUsuario: 1,
            email: 'admin@unac.edu.pe',
            passwordHash,
            nombres: 'Super',
            apellidos: 'Admin',
            rol: 'ADMIN',
            estado: true
        });

        // B. Usuario DOCENTE
        const userDocente = await Usuario.create({
            idUsuario: 2,
            email: 'juan.perez@unac.edu.pe',
            passwordHash,
            nombres: 'Juan',
            apellidos: 'Perez',
            rol: 'DOCENTE',
            estado: true
        });

        // C. Usuario EVALUADOR (Comisión)
        await Usuario.create({
            idUsuario: 99,
            email: 'comision@unac.edu.pe',
            passwordHash,
            nombres: 'Comisión',
            apellidos: 'Evaluadora',
            rol: 'ADMIN', 
            estado: true
        });

        console.log('✅ Usuarios creados.');

        // 3. Crear Perfil de DOCENTE
        // Usamos los campos exactos de tu modelo Docente.js
        await Docente.create({
            idDocente: 1, 
            idUsuario: userDocente.idUsuario,
            codigoDocente: '20230001', // Dato obligatorio agregado
            categoria: 'PRINCIPAL',
            departamentoAcademico: 'INGENIERIA DE SISTEMAS'
        });
        console.log('✅ Perfil Docente creado (ID: 1).');

        // 4. Crear PERIODO
        await Periodo.create({
            idPeriodo: 1,
            nombre: '2025-A',
            fechaInicio: '2025-03-01',
            fechaFin: '2025-07-31',
            estado: 'ACTIVO'
        });
        console.log('✅ Periodo 2025-A creado.');

        // 5. Crear RÚBRICA (Dimensiones e Items)
        
        // Crear Dimensión
        const dim1 = await Dimension.create({
            nombre: 'Gestión de la Enseñanza',
            peso: 30
        });

        // Crear Items (CORREGIDO SEGÚN MODELO RubricaItem.js)
        // Campos obligatorios: idItem, idDimension, numeroItem, concepto, puntajeMaximo, rolEvaluador
        await RubricaItem.bulkCreate([
            { 
                idItem: 1, 
                idDimension: dim1.idDimension,
                numeroItem: 1,                  // Requerido
                concepto: 'Entrega silabo',     // Antes era 'indicador'
                puntajeMaximo: 5.00,
                rolEvaluador: 'COMISION'        // Requerido (ENUM)
            },
            { 
                idItem: 2, 
                idDimension: dim1.idDimension,
                numeroItem: 2,                  // Requerido
                concepto: 'Cumplimiento avance', // Antes era 'indicador'
                puntajeMaximo: 5.00,
                rolEvaluador: 'COMISION'        // Requerido (ENUM)
            }
        ]);

        console.log('✅ Rúbrica creada correctamente (Items con formato válido).');
        console.log('🏁 Seed completado con éxito.');

    } catch (error) {
        console.error('❌ Error crítico en el seed:', error);
    } finally {
        await sequelize.close();
    }
};

seed();