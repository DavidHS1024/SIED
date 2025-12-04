import api from './axiosConfig';

export const DocenteService = {
    getDashboard: async () => {
        try {
            const response = await api.get('/docentes/dashboard');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error al cargar docentes' };
        }
    }
};