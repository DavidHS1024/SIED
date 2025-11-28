import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const CargaLectiva = sequelize.define('CargaLectiva', {
    idCarga: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idCarga'
    },
    idDocente: { type: DataTypes.INTEGER, allowNull: false },
    idCurso: { type: DataTypes.INTEGER, allowNull: false },
    idPeriodo: { type: DataTypes.INTEGER, allowNull: false },
    seccion: { type: DataTypes.STRING(5) }
}, {
    tableName: 'CargaLectiva',
    timestamps: false
});

export default CargaLectiva;
