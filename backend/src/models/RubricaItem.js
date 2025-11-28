import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const RubricaItem = sequelize.define('RubricaItem', {
    idItem: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idItem'
    },
    idDimension: { type: DataTypes.INTEGER, allowNull: false },
    numeroItem: { type: DataTypes.INTEGER, allowNull: false },
    concepto: { type: DataTypes.STRING(255), allowNull: false },
    puntajeMaximo: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
    rolEvaluador: {
        type: DataTypes.ENUM('ESTUDIANTE', 'COMISION', 'DOCENTE', 'SISTEMA', 'DIRECTOR'),
        allowNull: false
    }
}, {
    tableName: 'RubricaItem',
    timestamps: false
});

export default RubricaItem;