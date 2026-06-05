import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../context/AuthContext';
import { Calendar, Clock, FileText, LogOut, Menu, X, User, Briefcase, Receipt } from 'lucide-react';
import MobileGuard from './MobileGuard';
import AntiTamperGuard from './AntiTamperGuard';

export default function EmpleadoLayout({ children }) {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Control de Asistencia', path: '/empleado', icon: Clock },
    { name: 'Mis Vacaciones', path: '/empleado/vacaciones', icon: Calendar },
    { name: 'Mi Historial', path: '/empleado/historial', icon: FileText },
    { name: 'Mi Contrato Laboral', path: '/empleado/contrato', icon: Briefcase },
    { name: 'Mis Recibos de Nómina', path: '/empleado/nominas', icon: Receipt },
    { name: 'Mi Perfil y Geocercas', path: '/empleado/perfil', icon: User },
  ];

  const userSession = user || { sub: 'empleado@empresa.com', context: { nombre_completo: 'Colaborador' } };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f2942] text-white p-5 justify-between font-semibold text-xs text-left">
      <div className="space-y-8">
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2">
          <img 
            src="/logo_clara.png" 
            alt="Clara Logo" 
            className="h-16 w-auto object-contain bg-white/10 rounded-xl p-1.5"
          />
          <span className="text-[9px] bg-[#1ba0f2] text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider">Empleado</span>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#1ba0f2] text-white font-bold'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-white/70'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session card in sidebar bottom */}
      <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 px-2">
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-white/10 text-[#22ccf2]">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="truncate">
            <p className="text-white text-3xs font-extrabold leading-none truncate">{userSession.context?.nombre_completo || 'Colaborador'}</p>
            <p className="text-white/50 text-[10px] mt-1 leading-none truncate">{userSession.sub}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutClick}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white/80 hover:text-white transition duration-150 cursor-pointer text-3xs font-black uppercase tracking-wider"
        >
          <LogOut className="h-3.5 w-3.5 text-[#22ccf2]" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );

  return (
    <AntiTamperGuard>
      <MobileGuard>
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative text-slate-800">
          
          {/* 1. DESKTOP SIDEBAR (Visible on lg screens) */}
          <aside className="hidden lg:block lg:w-64 flex-shrink-0 h-screen sticky top-0 border-r border-slate-200">
            {sidebarContent}
          </aside>

          {/* 2. MOBILE TOP NAVBAR (Visible below lg screens) */}
          <header className="w-full bg-[#0f2942] text-white py-3 px-4 flex lg:hidden items-center justify-between sticky top-0 z-40 shadow-sm">
            <div className="flex items-center gap-2">
              <img 
                src="/logo_clara.png" 
                alt="Clara Logo" 
                className="h-14 w-auto object-contain bg-white/10 rounded-xl p-1.5"
              />
              <span className="text-[8px] bg-[#1ba0f2] text-white px-1 py-0.2 rounded font-black uppercase tracking-wider">Empleado</span>
            </div>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/90 cursor-pointer"
            >
              {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </header>

          {/* 3. MOBILE SIDEBAR DRAWER */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
              <div className="relative w-64 h-full animate-in slide-in-from-left duration-150">
                {sidebarContent}
              </div>
            </div>
          )}

          {/* 4. MAIN CONTENT CONTAINER */}
          <div className="flex-grow flex flex-col min-w-0">
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="py-4 border-t border-slate-200 bg-white text-center text-5xs font-bold text-slate-400 uppercase tracking-widest">
              <span>Clara Portal Colaborador &copy; 2026</span>
            </footer>
          </div>

        </div>
      </MobileGuard>
    </AntiTamperGuard>
  );
}
