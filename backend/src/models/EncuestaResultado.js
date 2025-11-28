import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const EncuestaResultado = sequelize.define('EncuestaResultado', {
    idResultado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idResultado'
    },
    idCarga: { type: DataTypes.INTEGER, allowNull: false },
    puntajePromedio: { type: DataTypes.DECIMAL(5, 2) },
    comentarios: { type: DataTypes.TEXT }
}, {
    tableName: 'EncuestaResultado',
    timestamps: false
});

export default EncuestaResultado;