import { sequelize, connectDB } from './src/config/database.js';
import { Usuario, Periodo, Docente, Dimension, RubricaItem } from './src/models/index.js'; 
import bcrypt from 'bcrypt';

/**
 * SEEDER DE DATOS MAESTROS (SIED v2.0)
 * Carga la Rúbrica Oficial del Reglamento UNAC (19 Ítems).
 */
const seed = async () => {
    try {
        console.log('🌱 Iniciando Seed SIED v2.0...');
        
        await connectDB();
        // force: true recrea las tablas basándose en los MODELOS.
        await sequelize.sync({ force: true }); 
        console.log('✅ Base de datos sincronizada (Tablas limpias).');

        // 1. USUARIOS Y ACTORES
        const passwordHash = await bcrypt.hash('123456', 10);

        // A. Admin
        await Usuario.create({
            idUsuario: 1,
            email: 'admin@unac.edu.pe',
            passwordHash,
            nombres: 'Super',
            apellidos: 'Administrador',
            rol: 'ADMIN',
            estado: true
        });

        // B. Docente (Juan Perez)
        const userDocente = await Usuario.create({
            idUsuario: 2,
            email: 'juan.perez@unac.edu.pe',
            passwordHash,
            nombres: 'Juan',
            apellidos: 'Perez',
            rol: 'DOCENTE',
            estado: true
        });

        await Docente.create({
            idDocente: 1, 
            idUsuario: userDocente.idUsuario,
            codigoDocente: '20230001',
            categoria: 'PRINCIPAL',
            departamentoAcademico: 'INGENIERIA DE SISTEMAS'
        });

        // C. Comisión Evaluadora
        await Usuario.create({
            idUsuario: 99,
            email: 'comision@unac.edu.pe',
            passwordHash,
            nombres: 'Comisión',
            apellidos: 'Evaluadora',
            rol: 'COMISION',
            estado: true
        });

        // D. Director
        await Usuario.create({
            idUsuario: 100,
            email: 'director@unac.edu.pe',
            passwordHash,
            nombres: 'Director',
            apellidos: 'Departamento',
            rol: 'DIRECTOR',
            estado: true
        });

        console.log('✅ Usuarios creados (Admin, Docente, Comisión, Director).');

        // 2. PERIODO ACADÉMICO
        await Periodo.create({
            idPeriodo: 1,
            nombre: '2025-A',
            fechaInicio: '2025-03-01',
            fechaFin: '2025-07-31',
            estado: 'ACTIVO'
        });
        console.log('✅ Periodo 2025-A activo.');

        // 3. RÚBRICA (DIMENSIONES E ITEMS - REGLAMENTO UNAC)
        
        // Dimensión 1
        const dim1 = await Dimension.create({ 
            idDimension: 1, 
            nombre: 'Proceso Enseñanza Aprendizaje', 
            descripcion: 'Evaluación por estudiantes, sílabo, plataforma, tutoría' // Si tu modelo Dimension.js tiene este campo
        });
        // Dimensión 2
        const dim2 = await Dimension.create({ 
            idDimension: 2, 
            nombre: 'Investigación', 
            descripcion: 'Proyectos, asesoría de tesis, jurado, publicaciones' 
        });
        // Dimensión 3
        const dim3 = await Dimension.create({ 
            idDimension: 3, 
            nombre: 'Extensión y Responsabilidad Social', 
            descripcion: 'Eventos académicos, RSU, organizaciones sociales' 
        });
        // Dimensión 4
        const dim4 = await Dimension.create({ 
            idDimension: 4, 
            nombre: 'Gestión Académico-Administrativa', 
            descripcion: 'Cargos directivos, comisiones' 
        });
        // Dimensión 5
        const dim5 = await Dimension.create({ 
            idDimension: 5, 
            nombre: 'Formación Profesional', 
            descripcion: 'Grados, especializaciones, capacitación, movilidad' 
        });

        // ITEMS
        const items = [
            // D1: Enseñanza
            { idDimension: 1, numeroItem: 1, concepto: 'Evaluación electrónica de estudiantes a docente', puntajeMaximo: 5.00, rolEvaluador: 'SISTEMA' },
            { idDimension: 1, numeroItem: 2, concepto: 'Sílabo (Subido, estructura, articulado)', puntajeMaximo: 7.00, rolEvaluador: 'COMISION' },
            { idDimension: 1, numeroItem: 3, concepto: 'Uso de Plataforma Educativa SGA', puntajeMaximo: 6.00, rolEvaluador: 'COMISION' },
            { idDimension: 1, numeroItem: 4, concepto: 'Tutoría', puntajeMaximo: 4.00, rolEvaluador: 'COMISION' },

            // D2: Investigación
            { idDimension: 2, numeroItem: 5, concepto: 'Proyecto y trabajos de Investigación científica', puntajeMaximo: 5.00, rolEvaluador: 'COMISION' },
            { idDimension: 2, numeroItem: 6, concepto: 'Asesoría de proyecto de investigación (Tesis)', puntajeMaximo: 6.00, rolEvaluador: 'COMISION' },
            { idDimension: 2, numeroItem: 7, concepto: 'Jurado de trabajo de investigación', puntajeMaximo: 3.00, rolEvaluador: 'COMISION' },
            { idDimension: 2, numeroItem: 8, concepto: 'Publicaciones científicas (últimos 2 años)', puntajeMaximo: 9.00, rolEvaluador: 'COMISION' },
            { idDimension: 2, numeroItem: 9, concepto: 'Participación en eventos científicos (presente año)', puntajeMaximo: 7.00, rolEvaluador: 'COMISION' },

            // D3: RSU
            { idDimension: 3, numeroItem: 10, concepto: 'Participación en evento académico (presente año)', puntajeMaximo: 3.00, rolEvaluador: 'COMISION' },
            { idDimension: 3, numeroItem: 11, concepto: 'Participación en proyectos de RSU (DUERS/CERES)', puntajeMaximo: 5.00, rolEvaluador: 'COMISION' },
            { idDimension: 3, numeroItem: 12, concepto: 'Participación activa en organización social', puntajeMaximo: 2.00, rolEvaluador: 'COMISION' },

            // D4: Gestión
            { idDimension: 4, numeroItem: 13, concepto: 'Desempeño en el cargo de dirección', puntajeMaximo: 5.00, rolEvaluador: 'DIRECTOR' },
            { idDimension: 4, numeroItem: 14, concepto: 'Participación en comisiones y coordinaciones', puntajeMaximo: 3.00, rolEvaluador: 'COMISION' },

            // D5: Formación
            { idDimension: 5, numeroItem: 15, concepto: 'Autoevaluación del docente', puntajeMaximo: 10.00, rolEvaluador: 'DOCENTE' },
            { idDimension: 5, numeroItem: 16, concepto: 'Formación (Grados académicos)', puntajeMaximo: 6.00, rolEvaluador: 'COMISION' },
            { idDimension: 5, numeroItem: 17, concepto: 'Certificaciones, diplomados, segunda especialidad', puntajeMaximo: 7.00, rolEvaluador: 'COMISION' },
            { idDimension: 5, numeroItem: 18, concepto: 'Capacitación y actualización', puntajeMaximo: 3.00, rolEvaluador: 'COMISION' },
            { idDimension: 5, numeroItem: 19, concepto: 'Movilidad docente', puntajeMaximo: 4.00, rolEvaluador: 'COMISION' }
        ];

        await RubricaItem.bulkCreate(items);

        console.log('✅ Rúbrica completa cargada (19 Ítems) según SQL v2.1');
        console.log('🏁 Seed completado con éxito.');

    } catch (error) {
        console.error('❌ Error crítico en el seed:', error);
    } finally {
        await sequelize.close();
    }
};

seed();