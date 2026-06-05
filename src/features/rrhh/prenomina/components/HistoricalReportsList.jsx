import { Clock, Download, ChevronLeft, ChevronRight, FileText, AlertCircle, RefreshCw } from 'lucide-react';

function HistoricalReportsList({
  reports,
  pagination,
  loading,
  onPageChange,
  onExportReport,
  onRecalculateReport,
  recalculatingId
}) {
  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Helper for month names
  const getMonthName = (monthNum) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[monthNum - 1] || 'Mes';
  };

  // Helper for status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'BORRADOR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-5xs font-black uppercase tracking-wider text-amber-650">
            Borrador
          </span>
        );
      case 'APROBADO_RRHH':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-5xs font-black uppercase tracking-wider text-sky-650">
            Aprobado
          </span>
        );
      case 'PROCESADO_PAGO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-5xs font-black uppercase tracking-wider text-emerald-650">
            Procesado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-5xs font-black uppercase tracking-wider text-slate-500">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Clock className="h-4.5 w-4.5 text-[#1ba0f2]" /> Historial de Cierres de Nómina
        </h3>
        <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Reportes cerrados y persistidos en la base de datos de la empresa</p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[140px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5 font-mono text-slate-400">ID Reporte</th>
              <th className="px-6 py-3.5">Colaborador</th>
              <th className="px-6 py-3.5 text-center">Periodo</th>
              <th className="px-6 py-3.5 text-right">Neto Liquidado</th>
              <th className="px-6 py-3.5 text-center">Estado</th>
              <th className="px-6 py-3.5 text-center">Generado el</th>
              <th className="px-6 py-3.5 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando registros...</span>
                  </div>
                </td>
              </tr>
            ) : reports.length > 0 ? (
              reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-[#0f2942]/5 transition">
                  {/* ID */}
                  <td className="px-6 py-4 font-mono font-bold text-slate-400" title={rep.id}>
                    {rep.id.substring(0, 8)}...
                  </td>

                  {/* Colaborador */}
                  <td className="px-6 py-4 font-extrabold text-[#0f2942]">
                    {rep.empleadoNombre}
                  </td>

                  {/* Periodo */}
                  <td className="px-6 py-4 text-center text-slate-650">
                    {getMonthName(rep.mesPeriodo)} {rep.anioPeriodo}
                  </td>

                  {/* Neto Liquidado */}
                  <td className="px-6 py-4 text-right font-mono font-bold text-slate-650">
                    {formatCurrency(rep.montoNetoPagar)}
                  </td>

                  {/* Estado */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1 justify-center">
                      {renderStatusBadge(rep.estadoReporte)}
                      {(rep.requiereRecalculo || rep.requiere_recalculo) && (
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-rose-250 bg-rose-50 px-2 py-0.5 text-5xs font-black uppercase tracking-wider text-rose-700 animate-pulse">
                          <AlertCircle className="h-2.5 w-2.5" /> Requiere Recálculo
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Generado el */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-slate-400 text-3xs">
                    {new Date(rep.generadoEl).toLocaleDateString()}
                  </td>

                  {/* Acciones */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {(rep.requiereRecalculo || rep.requiere_recalculo) && onRecalculateReport && (
                        <button
                          type="button"
                          disabled={recalculatingId === rep.id}
                          onClick={() => onRecalculateReport(rep)}
                          className="p-1.5 rounded-lg border border-amber-200 text-amber-650 hover:text-amber-700 hover:border-amber-400 hover:bg-amber-50 transition cursor-pointer"
                          title="Recalcular Pre-nómina"
                        >
                          <RefreshCw className={`h-4 w-4 ${recalculatingId === rep.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onExportReport('pdf', rep)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-650 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                        title="Descargar PDF"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Historial vacío</span>
                    <span className="text-3xs text-slate-450">No hay cierres mensuales ni reportes guardados en la base de datos.</span>
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
            Mostrando {reports.length} de {pagination.totalElements} reportes
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

export default HistoricalReportsList;
