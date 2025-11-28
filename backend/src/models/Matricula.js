import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Matricula = sequelize.define('Matricula', {
    idMatricula: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idMatricula'
    },
    idUsuarioEstudiante: { type: DataTypes.INTEGER, allowNull: false },
    idCarga: { type: DataTypes.INTEGER, allowNull: false },
    encuestaRealizada: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
    tableName: 'Matricula',
    timestamps: false
});

export default Matricula;