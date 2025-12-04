import api from './axiosConfig';

export const EvaluacionService = {
    // Guardar el checklist
    guardarEvaluacion: async (payload) => {
        try {
            const response = await api.post('/evaluacion', payload);
            return response.data;
        } catch (error) {
            console.error("Error guardando evaluación:", error);
            throw error.response?.data || { success: false, message: "Error de conexión" };
        }
    },

    // Ver si ya existe evaluación
    obtenerEvaluacion: async (idDocente, idPeriodo) => {
        try {
            const response = await api.get(`/evaluacion/${idDocente}/${idPeriodo}`);
            return response.data;
        } catch (error) {
            console.error("Error obteniendo evaluación:", error);
            throw error;
        }
    }
};