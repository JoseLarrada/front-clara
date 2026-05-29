import { Check, X, Palmtree, ChevronLeft, ChevronRight, ArrowRight, Plus } from 'lucide-react';

function VacacionesList({
  vacaciones,
  pagination,
  loading,
  onPageChange,
  onAddClick,
  onApprove,
  onReject
}) {
  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
            <Palmtree className="h-4.5 w-4.5 text-[#1ba0f2]" /> Solicitudes Pendientes
          </h3>
          <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">
            Revisión y autorización de periodos de descanso anual
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Registrar Solicitud
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[180px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5">Colaborador</th>
              <th className="px-6 py-3.5 text-center">Periodo Solicitado</th>
              <th className="px-6 py-3.5 text-center">Días Corrientes</th>
              <th className="px-6 py-3.5 text-center">Impacto de Saldo</th>
              <th className="px-6 py-3.5 text-right">Decisión de RRHH</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando solicitudes...</span>
                  </div>
                </td>
              </tr>
            ) : vacaciones.length > 0 ? (
              vacaciones.map((vac) => (
                <tr key={vac.id} className="hover:bg-[#0f2942]/5 transition">
                  
                  {/* Colaborador */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0f2942]/5 text-[#0f2942] font-black text-3xs uppercase flex items-center justify-center flex-shrink-0">
                        {vac.empleadoNombre.substring(0, 2)}
                      </div>
                      <div>
                        <span className="block font-extrabold text-[#0f2942]">{vac.empleadoNombre}</span>
                        <span className="block text-4xs text-slate-400 font-mono tracking-normal leading-none mt-0.5">{vac.empleadoId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Periodo */}
                  <td className="px-6 py-4 text-center text-slate-650">
                    <div className="inline-flex items-center gap-2 font-mono font-bold text-2xs bg-slate-50 border border-slate-150 rounded-lg px-2.5 py-1">
                      <span>{vac.fechaInicio}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{vac.fechaFin}</span>
                    </div>
                  </td>
                  
                  {/* Dias Solicitados */}
                  <td className="px-6 py-4 text-center font-mono font-black text-sm text-[#0f2942]">
                    {vac.diasSolicitados} <span className="text-4xs text-slate-450 font-bold uppercase">días</span>
                  </td>

                  {/* Impacto de Saldo */}
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center gap-2 font-mono font-bold">
                      <span className="text-slate-500">{vac.saldoVacacionesAntes}</span>
                      <ArrowRight className="h-3 w-3 text-slate-350" />
                      <span className="text-[#1ba0f2] font-black bg-[#1ba0f2]/5 px-2 py-0.5 rounded border border-[#1ba0f2]/10">
                        {vac.saldoVacacionesDespues}
                      </span>
                    </div>
                  </td>

                  {/* Decision */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onApprove(vac.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-4xs tracking-widest px-3 py-1.5 shadow-md shadow-emerald-500/10 cursor-pointer transition"
                      >
                        <Check className="h-3 w-3 stroke-[3]" /> Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => onReject(vac.id)}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black uppercase text-4xs tracking-widest px-3 py-1.5 shadow-md shadow-red-500/10 cursor-pointer transition"
                      >
                        <X className="h-3 w-3 stroke-[3]" /> Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center border border-emerald-100">
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    </div>
                    <span className="font-extrabold uppercase tracking-wider text-2xs mt-1 text-[#0f2942]">Sin Solicitudes Pendientes</span>
                    <span className="text-3xs text-slate-450">No hay solicitudes de vacaciones en cola para autorizar.</span>
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
            Mostrando {vacaciones.length} de {pagination.totalElements} solicitudes
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

export default VacacionesList;
