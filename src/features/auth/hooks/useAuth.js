import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { loginUser } from '../services/authService';

export const useAuth = () => {
  const { login, logout, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await loginUser(email, password);
      
      // Guardar el token en el contexto y localstorage
      login(data.access_token, data.refresh_token);
      
      // Decodificar el token para ver a dónde redirigir
      // El login() del contexto decodifica y llena el usuario.
      // Pero como el estado no se actualiza inmediatamente de forma síncrona en esta función,
      // decodificamos localmente o inspeccionamos el token devuelto.
      const payload = JSON.parse(atob(data.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const roles = payload.roles || [];
      
      if (roles.includes('ROLE_SUPER_ADMIN') || roles.includes('SUPERADMIN')) {
        navigate('/superadmin');
      } else if (roles.includes('ROLE_ADMIN_RRHH') || roles.includes('ADMIN_RRHH')) {
        navigate('/rrhh');
      } else {
        // En un futuro redirigirá al panel de empleado. De momento al home con alerta.
        navigate('/');
      }
      return true;
    } catch (err) {
      console.error('Error de login en hook:', err);
      // Obtener el mensaje devuelto por la API o un fallback
      const apiMessage = err.response?.data?.message || 'Error al iniciar sesión. Inténtalo de nuevo.';
      setError(apiMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return {
    handleLogin,
    handleLogout,
    loading,
    error,
    user
  };
};
