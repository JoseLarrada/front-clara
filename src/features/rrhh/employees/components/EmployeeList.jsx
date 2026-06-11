import { useState, useEffect } from 'react';
import { 
  ArrowUpDown, ChevronLeft, ChevronRight, Edit3, Trash2, 
  User, CheckCircle, XCircle, Search, Plus, UserPlus, Briefcase
} from 'lucide-react';
import { useS3Url } from '../../../../services/mediaService';

function EmployeeAvatar({ fotoPatronUrl, nombreCompleto }) {
  const { url } = useS3Url(fotoPatronUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  const isUrl = url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:'));

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 border border-slate-200">
      {isUrl && !hasError ? (
        <img 
          src={url} 
          alt={nombreCompleto} 
          className="h-full w-full rounded-full object-cover" 
          onError={() => setHasError(true)}
        />
      ) : (
        <User className="h-4.5 w-4.5" />
      )}
    </div>
  );
}

function EmployeeList({
  employees,
  searchTerm,
  onSearchChange,
  pagination,
  sort,
  loading,
  onPageChange,
  onSortChange,
  onEdit,
  onToggleActive,
  onModalidadChange,
  onDelete,
  onAddClick,
  onManageContracts
}) {
  const [sortField, sortDir] = sort.split(',');

  const renderSortIcon = (field) => {
    const active = sortField === field;
    return (
      <ArrowUpDown className={`inline-block ml-1 h-3.5 w-3.5 transition-colors ${
        active ? 'text-[#1ba0f2]' : 'text-slate-400 group-hover:text-slate-650'
      }`} />
    );
  };

  const getRolBadgeClass = (rol) => {
    if (rol === 'ADMIN_RRHH') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (rol === 'SUPERADMIN') return 'bg-[#0f2942] text-white border-transparent';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getModalidadBadgeClass = (mod) => {
    if (mod === 'PRESENCIAL') return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (mod === 'REMOTO') return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* 1. TOP SEARCH & ACTION BAR */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar colaborador por nombre o correo..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
          />
        </div>

        {/* Add Employee Button */}
        <button
          type="button"
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Nuevo Colaborador
        </button>

      </div>

      {/* 2. TABLE LIST */}
      <div className="overflow-x-auto relative min-h-[220px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5 font-mono text-slate-400">ID</th>
              <th 
                onClick={() => onSortChange('nombreCompleto')}
                className="px-6 py-3.5 cursor-pointer hover:bg-slate-150/50 group transition"
              >
                Colaborador {renderSortIcon('nombreCompleto')}
              </th>
              <th 
                onClick={() => onSortChange('rol')}
                className="px-6 py-3.5 cursor-pointer hover:bg-slate-150/50 group transition"
              >
                Rol {renderSortIcon('rol')}
              </th>
              <th className="px-6 py-3.5">Modalidad de Trabajo</th>
              <th 
                onClick={() => onSortChange('saldoVacaciones')}
                className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-150/50 group transition"
              >
                Vacaciones (Días) {renderSortIcon('saldoVacaciones')}
              </th>
              <th className="px-6 py-3.5 text-center">Estado</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              // Loader
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando personal...</span>
                  </div>
                </td>
              </tr>
            ) : employees.length > 0 ? (
              employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#0f2942]/5 transition">
                  {/* ID */}
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 max-w-[80px] truncate" title={emp.id}>
                    {emp.id.substring(0, 8)}...
                  </td>
                  
                  {/* Name / Email */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar 
                        fotoPatronUrl={emp.fotoPatronUrl} 
                        nombreCompleto={emp.nombreCompleto} 
                      />
                      <div className="text-left font-semibold">
                        <p className="text-sm font-extrabold text-[#0f2942] leading-none">{emp.nombreCompleto}</p>
                        <p className="text-3xs text-slate-450 mt-1 leading-none">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded px-2.5 py-0.5 text-4xs font-bold border ${getRolBadgeClass(emp.rol)}`}>
                      {emp.rol === 'ADMIN_RRHH' ? 'Administrador RRHH' : emp.rol === 'SUPERADMIN' ? 'SuperAdmin' : 'Colaborador'}
                    </span>
                  </td>

                  {/* Modalidad (Quick Update) */}
                  <td className="px-6 py-4">
                    <select
                      value={emp.modalidadPerfil}
                      onChange={(e) => onModalidadChange(emp.id, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white py-1 px-2.5 text-3xs font-extrabold uppercase tracking-wider text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#1ba0f2] cursor-pointer"
                    >
                      <option value="PRESENCIAL">Presencial</option>
                      <option value="HIBRIDO">Híbrido</option>
                      <option value="REMOTO">Remoto</option>
                    </select>
                  </td>

                  {/* Vacaciones */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#0f2942]">
                    {emp.saldoVacaciones}
                  </td>

                  {/* Activo (Toggle switch look alike) */}
                  <td className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => onToggleActive(emp)}
                      className={`inline-flex items-center gap-1 rounded px-2.5 py-0.5 text-4xs font-bold uppercase border tracking-wider transition cursor-pointer ${
                        emp.activo
                          ? 'bg-[#2abf5e]/10 text-[#2abf5e] border-[#2abf5e]/25'
                          : 'bg-red-50 text-red-650 border-red-200'
                      }`}
                      title={emp.activo ? 'Desactivar Empleado' : 'Activar Empleado'}
                    >
                      {emp.activo ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      {emp.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Contratos */}
                      <button
                        type="button"
                        onClick={() => onManageContracts(emp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-purple-600 hover:border-purple-300 hover:bg-purple-50 transition cursor-pointer"
                        title="Gestionar Contratación / Contratos"
                      >
                        <Briefcase className="h-4 w-4" />
                      </button>

                      {/* Editar */}
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-[#1ba0f2] hover:border-[#1ba0f2]/50 hover:bg-[#1ba0f2]/5 transition cursor-pointer"
                        title="Editar Colaborador"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Eliminar */}
                      <button
                        type="button"
                        onClick={() => onDelete(emp.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar Colaborador"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Empty State
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Sin colaboradores</span>
                    <span className="text-3xs text-slate-400">No se encontraron empleados registrados en la base de datos de esta empresa.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATOR FOOTER */}
      {!loading && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-150 bg-slate-50/30 flex items-center justify-between text-4xs font-bold text-slate-500 uppercase tracking-widest">
          <span>
            Mostrando {employees.length} de {pagination.totalElements} colaboradores
          </span>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page === 0}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-mono">
              Página {pagination.page + 1} de {pagination.totalPages}
            </span>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages - 1}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;
