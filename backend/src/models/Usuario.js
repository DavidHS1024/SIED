import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Usuario = sequelize.define('Usuario', {
    idUsuario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idUsuario' // Importante: coincide con la columna en Postgres
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    nombres: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    apellidos: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rol: {
        type: DataTypes.ENUM('ADMIN', 'DOCENTE', 'ESTUDIANTE', 'COMISION', 'DIRECTOR'),
        allowNull: false,
        defaultValue: 'ESTUDIANTE'
    },
    estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'Usuario', // Nombre exacto de la tabla en Postgres (ojo con las mayúsculas si usaste comillas en el SQL)
    timestamps: true,     // Postgres tiene createdAt
    updatedAt: false      // Si no definiste updatedAt en el SQL, ponlo false
});

export default Usuario;