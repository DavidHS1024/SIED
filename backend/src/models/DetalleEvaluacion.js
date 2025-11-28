import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const DetalleEvaluacion = sequelize.define('DetalleEvaluacion', {
    idDetalle: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idDetalle'
    },
    idEvaluacion: { type: DataTypes.INTEGER, allowNull: false },
    idItem: { type: DataTypes.INTEGER, allowNull: false },
    puntajeObtenido: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
    observacion: { type: DataTypes.TEXT },
    evaluadoPor: { type: DataTypes.INTEGER }, // ID del usuario evaluador
    fechaEvaluacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: 'DetalleEvaluacion',
    timestamps: false
});

export default DetalleEvaluacion;