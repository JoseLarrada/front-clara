import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let accessToken = null;
let logoutHandler = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const setLogoutHandler = (handler) => {
  logoutHandler = handler;
};

// Interceptor de solicitudes: adjunta el token JWT
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: maneja la expiración de tokens (401) y realiza refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Si recibimos un 401 y no hemos intentado ya reintentar la petición
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          // Realizar la llamada de refresco con una instancia limpia de Axios para evitar bucles
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
            refreshToken,
          });
          
          const { access_token, refresh_token } = response.data;
          
          // Actualizar tokens
          setAccessToken(access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          // Modificar los headers de la petición original y reintentar
          originalRequest.headers['Authorization'] = `Bearer ${access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('El refresco de token falló, cerrando sesión:', refreshError);
          localStorage.removeItem('refresh_token');
          setAccessToken(null);
          if (logoutHandler) logoutHandler();
          return Promise.reject(refreshError);
        }
      } else {
        setAccessToken(null);
        if (logoutHandler) logoutHandler();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
