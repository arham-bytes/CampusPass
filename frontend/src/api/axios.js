import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('campuspass_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('campuspass_token');
            localStorage.removeItem('campuspass_user');
            // Don't redirect on login/register failures
            if (!error.config.url.includes('/auth/')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
