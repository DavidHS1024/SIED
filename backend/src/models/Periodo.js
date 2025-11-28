import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Periodo = sequelize.define('Periodo', {
    idPeriodo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idPeriodo'
    },
    nombre: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    fechaInicio: {
        type: DataTypes.DATEONLY, // DATEONLY para solo fecha sin hora
        allowNull: false
    },
    fechaFin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('PLANIFICACION', 'ACTIVO', 'CERRADO'),
        defaultValue: 'PLANIFICACION'
    }
}, {
    tableName: 'Periodo',
    timestamps: false
});

export default Periodo;