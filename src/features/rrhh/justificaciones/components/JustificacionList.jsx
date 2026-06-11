import { Check, X, FileText, ChevronLeft, ChevronRight, FileDown, Plus } from 'lucide-react';
import { getDownloadUrl } from '../../../../services/mediaService';

function JustificacionList({
  justificaciones,
  pagination,
  loading,
  onPageChange,
  onAddClick,
  onActionClick
}) {
  const handleVerSoporte = async (e, fileKey) => {
    e.preventDefault();
    if (!fileKey) return;
    try {
      const url = await getDownloadUrl(fileKey);
      if (url) {
        window.open(url, '_blank');
      } else {
        alert('No se pudo generar el enlace de visualización para este soporte.');
      }
    } catch (err) {
      console.error('Error al abrir el soporte:', err);
      alert('Error de red al abrir el soporte.');
    }
  };
  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
            <FileText className="h-4.5 w-4.5 text-[#1ba0f2]" /> Bandeja de Incidencias
          </h3>
          <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">
            Justificaciones de retrasos o faltas pendientes de revisión
          </p>
        </div>

        <button
          type="button"
          onClick={onAddClick}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Registrar Justificación
        </button>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[180px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5">Colaborador</th>
              <th className="px-6 py-3.5 text-center">Fecha Incidencia</th>
              <th className="px-6 py-3.5">Motivo Solicitado</th>
              <th className="px-6 py-3.5 text-center">Soporte Adjunto</th>
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
            ) : justificaciones.length > 0 ? (
              justificaciones.map((just) => (
                <tr key={just.id} className="hover:bg-[#0f2942]/5 transition">
                  
                  {/* Colaborador */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#0f2942]/5 text-[#0f2942] font-black text-3xs uppercase flex items-center justify-center flex-shrink-0">
                        {just.empleadoNombre.substring(0, 2)}
                      </div>
                      <div>
                        <span className="block font-extrabold text-[#0f2942]">{just.empleadoNombre}</span>
                        <span className="block text-4xs text-slate-400 font-mono tracking-normal leading-none mt-0.5">{just.empleadoId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Fecha */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-600">
                    {just.fecha}
                  </td>
                  
                  {/* Motivo */}
                  <td className="px-6 py-4 text-slate-600 max-w-[280px]">
                    <p className="line-clamp-2 leading-relaxed text-slate-650" title={just.motivoEmpleado}>
                      {just.motivoEmpleado}
                    </p>
                  </td>

                  {/* Soporte */}
                  <td className="px-6 py-4 text-center">
                    {just.urlComprobanteS3 ? (
                      <button
                        type="button"
                        onClick={(e) => handleVerSoporte(e, just.urlComprobanteS3)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 hover:border-[#1ba0f2]/40 hover:bg-[#1ba0f2]/5 px-3 py-1.5 text-3xs font-extrabold uppercase tracking-wide text-slate-600 hover:text-[#1ba0f2] transition cursor-pointer bg-white"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                        Ver Soporte
                      </button>
                    ) : (
                      <span className="text-4xs text-slate-400 font-bold uppercase">Sin adjunto</span>
                    )}
                  </td>

                  {/* Decision */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onActionClick(just, 'approve')}
                        className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-4xs tracking-widest px-3 py-1.5 shadow-md shadow-emerald-500/10 cursor-pointer transition"
                      >
                        <Check className="h-3 w-3 stroke-[3]" /> Aprobar
                      </button>
                      <button
                        type="button"
                        onClick={() => onActionClick(just, 'reject')}
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
                    <span className="font-extrabold uppercase tracking-wider text-2xs mt-1 text-[#0f2942]">Sin Justificaciones Pendientes</span>
                    <span className="text-3xs text-slate-450">Todos los retardos y faltas de personal han sido procesados.</span>
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
            Mostrando {justificaciones.length} de {pagination.totalElements} incidencias
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

export default JustificacionList;
