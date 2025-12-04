import axios from 'axios';

// Si existe la variable de entorno VITE_API_URL, úsala. Si no, usa localhost.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000
});

export default api;