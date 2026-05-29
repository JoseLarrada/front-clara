import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-700 font-semibold text-xs gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ba0f2]" />
        <span className="font-extrabold uppercase tracking-widest text-4xs text-slate-400">Verificando credenciales...</span>
      </div>
    );
  }

  // Si no está autenticado, redirigir a Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si requiere roles específicos y el usuario no los tiene, redirigir al Home
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasPermission = allowedRoles.some((role) => userRoles.includes(role));
    
    if (!hasPermission) {
      console.warn(`Acceso denegado: El usuario no posee ninguno de los roles requeridos: ${allowedRoles.join(', ')}`);
      return <Navigate to="/" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;
