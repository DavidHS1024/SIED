import api from './axiosConfig';

export const ReporteService = {
    getGlobalStats: async () => {
        try {
            const response = await api.get('/reportes/global');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    }
};