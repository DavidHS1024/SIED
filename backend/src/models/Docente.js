import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Docente = sequelize.define('Docente', {
    idDocente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idDocente'
    },
    idUsuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'idUsuario'
    },
    codigoDocente: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    categoria: {
        type: DataTypes.STRING(50)
    },
    departamentoAcademico: {
        type: DataTypes.STRING(100)
    }
}, {
    tableName: 'Docente',
    timestamps: false
});

export default Docente;
