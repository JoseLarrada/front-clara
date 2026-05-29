import { createContext, useState, useEffect, useContext } from 'react';
import { decodeJWT } from '../utils/jwt';
import api, { setAccessToken, setLogoutHandler } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setTokenState] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define logout de forma limpia
  const logout = () => {
    setTokenState(null);
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('refresh_token');
  };

  const login = (accessToken, refreshToken) => {
    setTokenState(accessToken);
    setAccessToken(accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    const decoded = decodeJWT(accessToken);
    setUser(decoded);
  };

  // Efecto para inicializar la sesión en recargas de página
  useEffect(() => {
    setLogoutHandler(logout);
    
    const initializeAuth = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // Intentar obtener un access token nuevo en el arranque si ya existe refresh token
          const response = await api.post('/api/v1/auth/refresh', { refreshToken });
          const { access_token, refresh_token: newRefreshToken } = response.data;
          login(access_token, newRefreshToken || refreshToken);
        } catch (error) {
          console.error('No se pudo restaurar la sesión automática:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider');
  }
  return context;
};
