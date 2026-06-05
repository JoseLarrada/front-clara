import { useState, useEffect, useCallback } from 'react';
import RRHHLayout from '../../common/components/RRHHLayout';
import { getAuditLogs } from '../services/auditoriaService';
import { 
  ShieldCheck, Loader2, Calendar, User, Globe, AlertCircle, 
  Search, Eye, X, RefreshCw, ChevronLeft, ChevronRight 
} from 'lucide-react';

function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  
  // Filters
  const [accion, setAccion] = useState('');
  const [tablaAfectada, setTablaAfectada] = useState('');
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getAuditLogs({
        page: pagination.page,
        size: pagination.size,
        accion: accion || undefined,
        tablaAfectada: tablaAfectada || undefined
      });
      setLogs(res.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setApiError('No se pudieron cargar los logs de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, accion, tablaAfectada]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchLogs();
  };

  const handleClearFilters = () => {
    setAccion('');
    setTablaAfectada('');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const getActionColor = (actionName) => {
    if (!actionName) return 'border-slate-200 bg-slate-50 text-slate-650';
    if (actionName.includes('APROBAR') || actionName.includes('CREAR')) {
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }
    if (actionName.includes('RECHAZAR') || actionName.includes('ELIMINAR') || actionName.includes('SUSPENDER')) {
      return 'border-rose-200 bg-rose-50 text-rose-700';
    }
    if (actionName.includes('AJUSTE') || actionName.includes('ACTUALIZAR') || actionName.includes('MODIFICAR')) {
      return 'border-amber-200 bg-amber-50 text-amber-700';
    }
    return 'border-blue-200 bg-blue-50 text-blue-700';
  };

  const openLogDetail = (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const closeLogDetail = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  return (
    <RRHHLayout>
      <div className="space-y-8 text-left">
        
        {/* Header Section */}
        <div className="border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <ShieldCheck className="h-3.5 w-3.5" /> Seguridad e Integridad Corporativa
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Bitácora de Auditoría
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte y analice las transacciones administrativas de vacaciones, geocercas, horarios y nómina para certificar la consistencia del sistema.
          </p>
        </div>

        {/* Global Notifications */}
        {apiError && (
          <div className="rounded-xl bg-red-50 p-3.5 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Filter form */}
        <form onSubmit={handleSearch} className="rounded-3xl border border-slate-150 bg-white p-5 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-end font-semibold text-xs text-slate-700">
          <div className="flex-1 space-y-1.5 w-full">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Acción Administrativa</label>
            <input
              type="text"
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              placeholder="Ej. APROBAR_VACACIONES..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-2.5 px-3.5 text-xs font-bold text-[#0f2942] placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          <div className="flex-1 space-y-1.5 w-full">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Tabla Afectada</label>
            <input
              type="text"
              value={tablaAfectada}
              onChange={(e) => setTablaAfectada(e.target.value)}
              placeholder="Ej. solicitudes_vacaciones..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/20 py-2.5 px-3.5 text-xs font-bold text-[#0f2942] placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto font-bold text-4xs uppercase tracking-wider">
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex-1 md:flex-none py-3 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-550 transition cursor-pointer"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 md:flex-none py-3 px-6 rounded-xl bg-[#0f2942] hover:bg-[#0f2942]/90 text-white transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Filtrar
            </button>
          </div>
        </form>

        {/* Audit Log Table */}
        <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden font-semibold text-xs text-slate-700">
          <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-[#1ba0f2]" /> Historial de Cambios del Sistema
              </h3>
              <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Registros del libro de auditoría de seguridad</p>
            </div>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto relative min-h-[160px]">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
                <tr>
                  <th className="px-6 py-3.5 font-mono text-slate-400">ID Log</th>
                  <th className="px-6 py-3.5">Administrador</th>
                  <th className="px-6 py-3.5">Operación / Acción</th>
                  <th className="px-6 py-3.5 text-center">Tabla Afectada</th>
                  <th className="px-6 py-3.5 text-center">Dirección IP</th>
                  <th className="px-6 py-3.5 text-center">Fecha y Hora</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                        <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando bitácora...</span>
                      </div>
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-[#0f2942]/5 transition">
                      {/* ID */}
                      <td className="px-6 py-4 font-mono font-bold text-slate-400" title={log.id}>
                        {log.id.substring(0, 8)}...
                      </td>

                      {/* Operador */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-[#1ba0f2]" />
                          <div>
                            <span className="block font-extrabold text-[#0f2942]">{log.usuarioNombre}</span>
                            <span className="block text-4xs text-slate-450 font-mono leading-none mt-0.5">{log.rolUsuario}</span>
                          </div>
                        </div>
                      </td>

                      {/* Acción */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-5xs font-black uppercase tracking-wider ${getActionColor(log.accion)}`}>
                          {log.accion}
                        </span>
                      </td>

                      {/* Tabla */}
                      <td className="px-6 py-4 text-center text-slate-650 font-mono text-3xs">
                        {log.tablaAfectada}
                      </td>

                      {/* IP */}
                      <td className="px-6 py-4 text-center font-mono text-slate-500 text-3xs">
                        <span className="inline-flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-slate-350" /> {log.direccionIp}
                        </span>
                      </td>

                      {/* Creado En */}
                      <td className="px-6 py-4 text-center font-mono text-slate-450 text-3xs">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-350" /> {new Date(log.creadoEn).toLocaleString()}
                        </span>
                      </td>

                      {/* Ver detalle */}
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => openLogDetail(log)}
                          className="p-1.5 rounded-lg border border-slate-200 text-[#0f2942] hover:text-[#1ba0f2] hover:border-[#1ba0f2] hover:bg-[#1ba0f2]/5 transition cursor-pointer"
                          title="Inspeccionar Cambios"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center gap-1 text-slate-400">
                        <span className="font-extrabold uppercase tracking-wider">Bitácora Vacía</span>
                        <span className="text-3xs text-slate-450">No hay registros administrativos que coincidan con los criterios.</span>
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
                Mostrando {logs.length} de {pagination.totalElements} logs
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page === 0}
                  onClick={() => handlePageChange(pagination.page - 1)}
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
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Audit Log JSON Details Drawer/Modal */}
      {isModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-150 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
              <div>
                <span className="text-4xs font-mono font-black text-slate-400 uppercase tracking-widest">Transacción: {selectedLog.id}</span>
                <h3 className="text-md font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#1ba0f2]" /> Detalles de Registro e Historial
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLogDetail}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 font-semibold text-xs text-slate-700">
              
              {/* Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-3.5">
                  <span className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">Operador</span>
                  <span className="block font-black text-[#0f2942] mt-1 truncate">{selectedLog.usuarioNombre}</span>
                </div>
                <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-3.5">
                  <span className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">Operación</span>
                  <span className="block font-black text-[#0f2942] mt-1 truncate">{selectedLog.accion}</span>
                </div>
                <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-3.5">
                  <span className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">Tabla Afectada</span>
                  <span className="block font-black text-[#0f2942] mt-1 truncate font-mono text-3xs">{selectedLog.tablaAfectada}</span>
                </div>
                <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-3.5">
                  <span className="block text-4xs font-bold text-slate-400 uppercase tracking-wider">Dirección IP</span>
                  <span className="block font-black text-[#0f2942] mt-1 truncate font-mono text-3xs">{selectedLog.direccionIp}</span>
                </div>
              </div>

              {/* JSON Diff block */}
              <div className="space-y-3">
                <span className="text-4xs font-bold text-slate-500 uppercase tracking-wider block">Inspección de Cambios de Datos (JSON Diff)</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Prior value block */}
                  <div className="space-y-1.5 flex flex-col h-full">
                    <span className="text-4xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-rose-400 rounded-full" /> Estado Anterior
                    </span>
                    <div className="flex-1 rounded-2xl border border-slate-150 bg-slate-900/5 p-4 overflow-x-auto min-h-[180px] font-mono text-3xs text-slate-650 flex flex-col justify-start">
                      {selectedLog.valorAnterior ? (
                        <pre className="text-left select-all whitespace-pre-wrap">
                          {JSON.stringify(selectedLog.valorAnterior, null, 2)}
                        </pre>
                      ) : (
                        <div className="my-auto text-center text-slate-400 italic">
                          No existían registros previos (Operación de Creación/Alta)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* New value block */}
                  <div className="space-y-1.5 flex flex-col h-full">
                    <span className="text-4xs font-black uppercase tracking-widest text-[#1ba0f2] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Estado Nuevo
                    </span>
                    <div className="flex-1 rounded-2xl border border-[#1ba0f2]/20 bg-emerald-500/5 p-4 overflow-x-auto min-h-[180px] font-mono text-3xs text-[#0f2942] flex flex-col justify-start">
                      {selectedLog.valorNuevo ? (
                        <pre className="text-left select-all whitespace-pre-wrap text-emerald-850">
                          {JSON.stringify(selectedLog.valorNuevo, null, 2)}
                        </pre>
                      ) : (
                        <div className="my-auto text-center text-slate-400 italic">
                          Registro eliminado (Operación de Baja)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex justify-end font-bold text-4xs uppercase tracking-wider">
              <button
                type="button"
                onClick={closeLogDetail}
                className="py-2.5 px-6 rounded-xl bg-[#0f2942] hover:bg-[#0f2942]/90 text-white transition cursor-pointer shadow-xs"
              >
                Cerrar Detalle
              </button>
            </div>

          </div>
        </div>
      )}

    </RRHHLayout>
  );
}

export default AuditLogsPage;
