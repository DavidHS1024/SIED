import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Curso = sequelize.define('Curso', {
    idCurso: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idCurso'
    },
    codigo: { type: DataTypes.STRING(20), allowNull: false },
    nombre: { type: DataTypes.STRING(100), allowNull: false }
}, {
    tableName: 'Curso',
    timestamps: false
});

export default Curso;