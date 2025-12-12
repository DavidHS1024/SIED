import { Dimension, RubricaItem } from '../models/index.js';

export const getRubricaCompleta = async (req, res) => {
    try {
        // "Eager Loading": Traemos Dimensiones e incluimos sus Items hijos
        const rubrica = await Dimension.findAll({
            include: [{
                model: RubricaItem,
                as: 'RubricaItems', // Sequelize pluraliza automáticamente, pero a veces requiere ajuste
                // Ordenar los items por su número (1, 2, 3...)
                order: [['numeroItem', 'ASC']]
            }],
            // Ordenamos las dimensiones por su ID
            order: [['idDimension', 'ASC']]
        });

        res.json({
            success: true,
            data: rubrica
        });
    } catch (error) {
        console.error('Error al obtener rúbrica:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cargar la estructura de evaluación'
        });
    }
};