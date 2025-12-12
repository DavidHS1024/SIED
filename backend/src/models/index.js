import { sequelize } from '../config/database.js';
import Usuario from './Usuario.js';
import Docente from './Docente.js';
import Periodo from './Periodo.js';
import Dimension from './Dimension.js';
import RubricaItem from './RubricaItem.js';
import EvaluacionDocente from './EvaluacionDocente.js';
import DetalleEvaluacion from './DetalleEvaluacion.js';
import Curso from './Curso.js';
import CargaLectiva from './CargaLectiva.js';
import Matricula from './Matricula.js';
import EncuestaResultado from './EncuestaResultado.js';

// --- RELACIONES ---

// 1. Usuario & Docente
Usuario.hasOne(Docente, { foreignKey: 'idUsuario', onDelete: 'CASCADE' });
Docente.belongsTo(Usuario, { foreignKey: 'idUsuario' });

// 2. Rúbrica (Dimensiones -> Items)
Dimension.hasMany(RubricaItem, { foreignKey: 'idDimension' });
RubricaItem.belongsTo(Dimension, { foreignKey: 'idDimension' });

// 3. Evaluación Principal
Docente.hasMany(EvaluacionDocente, { foreignKey: 'idDocente' });
EvaluacionDocente.belongsTo(Docente, { foreignKey: 'idDocente' });

Periodo.hasMany(EvaluacionDocente, { foreignKey: 'idPeriodo' });
EvaluacionDocente.belongsTo(Periodo, { foreignKey: 'idPeriodo' });

// 4. Detalle de Evaluación
EvaluacionDocente.hasMany(DetalleEvaluacion, { foreignKey: 'idEvaluacion', onDelete: 'CASCADE' });
DetalleEvaluacion.belongsTo(EvaluacionDocente, { foreignKey: 'idEvaluacion' });

RubricaItem.hasMany(DetalleEvaluacion, { foreignKey: 'idItem' });
DetalleEvaluacion.belongsTo(RubricaItem, { foreignKey: 'idItem' });

// 5. Gestión Académica (Cursos y Carga)
Docente.hasMany(CargaLectiva, { foreignKey: 'idDocente' });
CargaLectiva.belongsTo(Docente, { foreignKey: 'idDocente' });

Curso.hasMany(CargaLectiva, { foreignKey: 'idCurso' });
CargaLectiva.belongsTo(Curso, { foreignKey: 'idCurso' });

Periodo.hasMany(CargaLectiva, { foreignKey: 'idPeriodo' });
CargaLectiva.belongsTo(Periodo, { foreignKey: 'idPeriodo' });

// 6. Estudiantes y Matrícula
Usuario.hasMany(Matricula, { foreignKey: 'idUsuarioEstudiante' }); // Estudiantes son Usuarios
Matricula.belongsTo(Usuario, { foreignKey: 'idUsuarioEstudiante', as: 'Estudiante' });

CargaLectiva.hasMany(Matricula, { foreignKey: 'idCarga' });
Matricula.belongsTo(CargaLectiva, { foreignKey: 'idCarga' });

// 7. Resultados de Encuesta
CargaLectiva.hasMany(EncuestaResultado, { foreignKey: 'idCarga' });
EncuestaResultado.belongsTo(CargaLectiva, { foreignKey: 'idCarga' });

export {
    sequelize, // Exportar la instancia para usarla en app.js
    Usuario,
    Docente,
    Periodo,
    Dimension,
    RubricaItem,
    EvaluacionDocente,
    DetalleEvaluacion,
    Curso,
    CargaLectiva,
    Matricula,
    EncuestaResultado
};