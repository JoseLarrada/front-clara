import { Search, Filter, Trash2, Edit3, ShieldAlert, ShieldCheck, ArrowUpDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

function EnterpriseList({
  empresas,
  pagination,
  filters,
  sort,
  loading,
  onPageChange,
  onFilterChange,
  onClearFilters,
  onSortChange,
  onEdit,
  onToggleLicense,
  onDelete
}) {
  const [sortField, sortDir] = sort.split(',');

  const rubros = ['INDUSTRIAL', 'SERVICIOS', 'COMERCIO', 'ALIMENTOS', 'LOGISTICA', 'SALUD'];

  const getRubroBadgeClass = (rubro) => {
    switch (rubro?.toUpperCase()) {
      case 'INDUSTRIAL': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SERVICIOS': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMERCIO': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ALIMENTOS': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOGISTICA': return 'bg-sky-50 text-sky-700 border-sky-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getLicenciaBadgeClass = (estado) => {
    return estado === 'ACTIVO'
      ? 'bg-[#2abf5e]/10 text-[#2abf5e] border-[#2abf5e]/25'
      : 'bg-red-50 text-red-650 border-red-200';
  };

  const renderSortIcon = (field) => {
    const active = sortField === field;
    return (
      <ArrowUpDown className={`inline-block ml-1 h-3.5 w-3.5 transition-colors ${
        active ? 'text-[#1ba0f2]' : 'text-slate-400 group-hover:text-slate-600'
      }`} />
    );
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* 1. FILTERS BAR */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 space-y-4">
        <h4 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Filter className="h-4 w-4 text-[#1ba0f2]" /> Filtros de Búsqueda
        </h4>
        
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-end">
          {/* Nombre filter */}
          <div className="space-y-1">
            <label className="block text-5xs font-black text-slate-400 uppercase tracking-widest">Nombre de Empresa</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ej: Fábrica..."
                value={filters.nombre}
                onChange={(e) => onFilterChange('nombre', e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* NIT filter */}
          <div className="space-y-1">
            <label className="block text-5xs font-black text-slate-400 uppercase tracking-widest">NIT / RUT</label>
            <input
              type="text"
              placeholder="901445882-3"
              value={filters.nitRut}
              onChange={(e) => onFilterChange('nitRut', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          {/* Rubro filter */}
          <div className="space-y-1">
            <label className="block text-5xs font-black text-slate-400 uppercase tracking-widest">Rubro</label>
            <select
              value={filters.rubro}
              onChange={(e) => onFilterChange('rubro', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            >
              <option value="">Todos los Rubros</option>
              {rubros.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Licencia filter */}
          <div className="space-y-1">
            <label className="block text-5xs font-black text-slate-400 uppercase tracking-widest">Estado Licencia</label>
            <select
              value={filters.estadoLicencia}
              onChange={(e) => onFilterChange('estadoLicencia', e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            >
              <option value="">Todos los Estados</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="SUSPENDIDO">SUSPENDIDO</option>
            </select>
          </div>

          {/* Clear button */}
          <button
            type="button"
            onClick={onClearFilters}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-250 hover:bg-slate-100 bg-white py-2 px-4 text-xs font-bold text-slate-600 transition cursor-pointer"
          >
            <X className="h-3.5 w-3.5" /> Limpiar
          </button>
        </div>
      </div>

      {/* 2. TABLE */}
      <div className="overflow-x-auto relative min-h-[220px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5 font-mono text-slate-400">ID</th>
              <th 
                onClick={() => onSortChange('nombre')}
                className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/50 group transition"
              >
                Empresa {renderSortIcon('nombre')}
              </th>
              <th className="px-6 py-3.5">NIT / RUT</th>
              <th 
                onClick={() => onSortChange('rubro')}
                className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/50 group transition"
              >
                Rubro {renderSortIcon('rubro')}
              </th>
              <th 
                onClick={() => onSortChange('limiteEmpleados')}
                className="px-6 py-3.5 text-center cursor-pointer hover:bg-slate-100/50 group transition"
              >
                Límite Empleados {renderSortIcon('limiteEmpleados')}
              </th>
              <th className="px-6 py-3.5 text-center">Estado Licencia</th>
              <th 
                onClick={() => onSortChange('creadoEn')}
                className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/50 group transition"
              >
                Registrada {renderSortIcon('creadoEn')}
              </th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              // Loading Spinner
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando empresas...</span>
                  </div>
                </td>
              </tr>
            ) : empresas.length > 0 ? (
              empresas.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#0f2942]/5 transition">
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 max-w-[80px] truncate" title={emp.id}>
                    {emp.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 font-extrabold text-[#0f2942]">
                    {emp.nombre}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-550">
                    {emp.nitRut}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider border ${getRubroBadgeClass(emp.rubro)}`}>
                      {emp.rubro}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-mono font-bold text-[#0f2942]">
                    {emp.limiteEmpleados}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex rounded px-2.5 py-0.5 text-4xs font-bold uppercase tracking-wider border ${getLicenciaBadgeClass(emp.estadoLicencia)}`}>
                      {emp.estadoLicencia}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {new Date(emp.creadoEn).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Edit button */}
                      <button
                        type="button"
                        onClick={() => onEdit(emp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#1ba0f2] hover:border-[#1ba0f2]/50 hover:bg-[#1ba0f2]/5 transition cursor-pointer"
                        title="Editar Empresa"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      {/* Toggle status */}
                      <button
                        type="button"
                        onClick={() => onToggleLicense(emp.id, emp.estadoLicencia)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          emp.estadoLicencia === 'ACTIVO'
                            ? 'border-slate-200 text-amber-650 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50'
                            : 'border-slate-200 text-emerald-650 hover:text-emerald-700 hover:border-emerald-400 hover:bg-emerald-50'
                        }`}
                        title={emp.estadoLicencia === 'ACTIVO' ? 'Suspender Licencia' : 'Activar Licencia'}
                      >
                        {emp.estadoLicencia === 'ACTIVO' ? (
                          <ShieldAlert className="h-4 w-4" />
                        ) : (
                          <ShieldCheck className="h-4 w-4" />
                        )}
                      </button>

                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => onDelete(emp.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar Empresa"
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
                <td colSpan="8" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Sin coincidencias</span>
                    <span className="text-3xs text-slate-400">No encontramos empresas que coincidan con los filtros aplicados.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. PAGINATOR */}
      {!loading && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-150 bg-slate-50/30 flex items-center justify-between text-4xs font-bold text-slate-500 uppercase tracking-widest">
          <span>
            Mostrando {empresas.length} de {pagination.totalElements} empresas
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

export default EnterpriseList;
