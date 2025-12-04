import api from './axiosConfig';

export const AuthService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            // Si el login es exitoso, guardamos el token y el usuario en el navegador
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            return response.data;
        } catch (error) {
            // Manejo de error robusto
            throw error.response?.data?.message || "Error de conexión con el servidor";
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/'; // Redirigir al login
    },

    // Función útil para recuperar el usuario guardado
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};