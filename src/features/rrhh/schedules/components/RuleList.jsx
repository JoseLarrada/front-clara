import { Edit3, Trash2, Clock, Calendar, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

function RuleList({
  rules,
  pagination,
  loading,
  onPageChange,
  onEdit,
  onDelete,
  onAddClick
}) {
  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
            <Clock className="h-4.5 w-4.5 text-[#1ba0f2]" /> Plantillas de Horario
          </h3>
          <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Configure turnos de entrada y salida laboral</p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Nueva Jornada
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[180px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5 font-mono text-slate-400">ID</th>
              <th className="px-6 py-3.5">Descripción de Jornada</th>
              <th className="px-6 py-3.5 text-center">Entrada</th>
              <th className="px-6 py-3.5 text-center">Salida</th>
              <th className="px-6 py-3.5 text-center">Tolerancia (Min)</th>
              <th className="px-6 py-3.5 text-center">Límite Falta (Min)</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando jornadas...</span>
                  </div>
                </td>
              </tr>
            ) : rules.length > 0 ? (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-[#0f2942]/5 transition">
                  {/* ID */}
                  <td className="px-6 py-4 font-mono font-bold text-slate-400 max-w-[80px] truncate" title={rule.id}>
                    {rule.id.substring(0, 8)}...
                  </td>
                  
                  {/* Descripción */}
                  <td className="px-6 py-4 font-extrabold text-[#0f2942]">
                    {rule.descripcion}
                  </td>
                  
                  {/* Entrada */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-650">
                    {rule.horaEntradaOficial}
                  </td>
                  
                  {/* Salida */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-650">
                    {rule.horaSalidaOficial}
                  </td>

                  {/* Tolerancia */}
                  <td className="px-6 py-4 text-center font-mono">
                    {rule.minutosToleranciaRetardo} Min
                  </td>

                  {/* Límite Falta */}
                  <td className="px-6 py-4 text-center font-mono">
                    {rule.tiempoLimiteFaltaMinutos} Min
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(rule)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-[#1ba0f2] hover:border-[#1ba0f2]/50 hover:bg-[#1ba0f2]/5 transition cursor-pointer"
                        title="Editar Jornada"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(rule.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Eliminar Jornada"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Sin jornadas</span>
                    <span className="text-3xs text-slate-400">No se han registrado turnos u horarios laborales para esta empresa.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginator */}
      {!loading && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-150 bg-slate-50/30 flex items-center justify-between text-4xs font-bold text-slate-500 uppercase tracking-widest">
          <span>
            Mostrando {rules.length} de {pagination.totalElements} jornadas
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

export default RuleList;
