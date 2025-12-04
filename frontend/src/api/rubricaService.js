import api from './axiosConfig';

export const RubricaService = {
    /**
     * Obtiene la rúbrica completa (Dimensiones con sus Items anidados)
     * Endpoint: GET /api/rubrica
     */
    obtenerRubrica: async () => {
        try {
            const response = await api.get('/rubrica');
            return response.data;
        } catch (error) {
            console.error("Error al obtener la rúbrica:", error);
            throw error;
        }
    }
};