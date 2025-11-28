import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const EvaluacionDocente = sequelize.define('EvaluacionDocente', {
    idEvaluacion: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idEvaluacion'
    },
    idDocente: { type: DataTypes.INTEGER, allowNull: false },
    idPeriodo: { type: DataTypes.INTEGER, allowNull: false },
    puntajeFinal: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
    categoria: { type: DataTypes.STRING(50), defaultValue: 'PENDIENTE' },
    estado: {
        type: DataTypes.ENUM('EN_PROCESO', 'FINALIZADO'),
        defaultValue: 'EN_PROCESO'
    },
    fechaCierre: { type: DataTypes.DATE }
}, {
    tableName: 'EvaluacionDocente',
    timestamps: false
});

export default EvaluacionDocente;