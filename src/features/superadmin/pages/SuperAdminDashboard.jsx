import { Calendar, LogOut, Plus, ShieldCheck, User, Building2, UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import DashboardStats from '../components/DashboardStats';
import EnterpriseList from '../components/EnterpriseList';
import EnterpriseModal from '../components/EnterpriseModal';
import AdminRegistrationForm from '../components/AdminRegistrationForm';

function SuperAdminDashboard() {
  const { handleLogout } = useAuth();
  const {
    stats,
    statsLoading,
    empresas,
    pagination,
    filters,
    sort,
    loading,
    actionLoading,
    apiError,
    isModalOpen,
    activeEmpresa,
    activeTab,
    setActiveTab,
    registerSuccess,
    setRegisterSuccess,
    registerError,
    setRegisterError,
    handleRegisterUser,
    handlePageChange,
    handleFilterChange,
    handleClearFilters,
    handleSortChange,
    handleCreateOrUpdate,
    handleToggleLicense,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  } = useSuperAdmin();

  const userSession = useAuth().user || { sub: 'SuperAdmin', context: { nombre_completo: 'Administrador Global' } };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        {/* 1. HEADER / TOP NAVBAR */}
        <header className="w-full bg-[#0f2942] text-white py-4 px-6 sticky top-0 z-40 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5 text-xl font-bold">
              <img 
                src="/logo_clara.png" 
                alt="Clara Logo" 
                className="h-16 md:h-20 w-auto object-contain bg-white/10 rounded-xl p-1.5"
              />
              <span className="text-xs bg-[#1ba0f2] hover:bg-[#1ba5f2] text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                SuperAdmin
              </span>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 border-r border-white/10 pr-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[#22ccf2]">
                  <User className="h-4.5 w-4.5" />
                </div>
                <div className="text-left font-semibold text-3xs">
                  <p className="text-white leading-none font-bold">{userSession.context?.nombre_completo || 'Admin'}</p>
                  <p className="text-white/60 mt-0.5 leading-none">{userSession.sub}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/20 hover:bg-white/10 px-4 py-2 text-xs font-bold text-white transition duration-150 cursor-pointer"
              >
                <LogOut className="h-4 w-4 text-[#22ccf2]" />
                Salir
              </button>
            </div>
          </div>
        </header>

        {/* 2. MAIN DASHBOARD CONTENT */}
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 border-[#1ba0f2] pl-4 animate-in fade-in duration-200">
            <div className="text-left">
              <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
                <ShieldCheck className="h-3 w-3" /> Consola de Control Global
              </span>
              <h1 className="mt-4 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
                {activeTab === 'empresas' ? 'Consola de Empresas' : 'Gestión de Credenciales'}
              </h1>
              <p className="mt-3 text-sm text-slate-650 font-semibold leading-relaxed">
                {activeTab === 'empresas' 
                  ? 'Gestione la creación, configuración, licencias y límites del esquema multi-tenant de Clara.'
                  : 'Cree nuevos usuarios y asigne privilegios de SuperAdmin, Administrador de RRHH o Empleado.'}
              </p>
            </div>
            
            {activeTab === 'empresas' && (
              <button
                type="button"
                onClick={openCreateModal}
                className="sm:self-end inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-6 py-3 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/15 transition duration-150 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Nueva Empresa
              </button>
            )}
          </div>

          {/* Navegación por Pestañas */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('empresas')}
              className={`flex items-center gap-2 px-6 py-3.5 border-b-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'empresas'
                  ? 'border-[#1ba0f2] text-[#1ba0f2] bg-white rounded-t-2xl shadow-xs'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-t-2xl'
              }`}
            >
              <Building2 className="h-4.5 w-4.5" />
              Consola de Empresas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`flex items-center gap-2 px-6 py-3.5 border-b-2 text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                activeTab === 'register'
                  ? 'border-[#1ba0f2] text-[#1ba0f2] bg-white rounded-t-2xl shadow-xs'
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-t-2xl'
              }`}
            >
              <UserPlus className="h-4.5 w-4.5" />
              Registrar Usuarios
            </button>
          </div>

          {activeTab === 'empresas' ? (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Stats Bar */}
              <DashboardStats stats={stats} loading={statsLoading} />

              {/* Enterprise management panel */}
              <section className="space-y-4">
                <div className="text-left">
                  <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Directorio de Clientes</h2>
                  <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">Consulte, filtre y edite las licencias de inquilinos de Clara</p>
                </div>
                
                <EnterpriseList
                  empresas={empresas}
                  pagination={pagination}
                  filters={filters}
                  sort={sort}
                  loading={loading}
                  onPageChange={handlePageChange}
                  onFilterChange={handleFilterChange}
                  onClearFilters={handleClearFilters}
                  onSortChange={handleSortChange}
                  onEdit={openEditModal}
                  onToggleLicense={handleToggleLicense}
                  onDelete={handleDelete}
                />
              </section>
            </div>
          ) : (
            <div className="animate-in fade-in duration-200">
              <AdminRegistrationForm
                empresas={empresas}
                onSubmit={handleRegisterUser}
                error={registerError}
                success={registerSuccess}
                setSuccess={setRegisterSuccess}
                setError={setRegisterError}
                loading={actionLoading}
              />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white text-center text-4xs font-bold text-slate-400 uppercase tracking-widest">
        <span>Clara Admin Platform &copy; 2026</span>
      </footer>

      {/* Create / Edit Modal */}
      <EnterpriseModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleCreateOrUpdate}
        activeEmpresa={activeEmpresa}
        apiError={apiError}
        actionLoading={actionLoading}
      />
    </div>
  );
}

export default SuperAdminDashboard;
