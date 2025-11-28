import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Dimension = sequelize.define('Dimension', {
    idDimension: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'idDimension'
    },
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.TEXT }
}, {
    tableName: 'Dimension',
    timestamps: false
});

export default Dimension;