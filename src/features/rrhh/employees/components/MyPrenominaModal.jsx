import { useState, useEffect, useCallback } from 'react';
import { 
  X, Receipt, Calendar, Loader2, AlertCircle, 
  ChevronLeft, ChevronRight, Eye, Info, DollarSign, Download 
} from 'lucide-react';
import { getMisReportesPrenomina } from '../services/employeeService';

export default function MyPrenominaModal({ isOpen, onClose }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtering & Pagination
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(5);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Detail view of selected prenomina report
  const [selectedReport, setSelectedReport] = useState(null);

  // Default date ranges (from 1st of current month to today)
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    
    // Set default range to year-01-01 to year-12-31 to be sure we find records
    setFechaInicio(`${year}-01-01`);
    setFechaFin(today.toISOString().substring(0, 10));
  }, []);

  const fetchReports = useCallback(async (targetPage = 0) => {
    if (!fechaInicio || !fechaFin) {
      setError('Las fechas de inicio y fin son obligatorias.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await getMisReportesPrenomina({
        fechaInicio,
        fechaFin,
        page: targetPage,
        size,
        sort: 'anioPeriodo,desc'
      });
      
      setReports(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
      setPage(data.pageNumber || 0);
      
      // Select the first report by default if none is selected
      if (data.content && data.content.length > 0) {
        setSelectedReport(data.content[0]);
      } else {
        setSelectedReport(null);
      }
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los reportes de pre-nómina.');
    } finally {
      setLoading(false);
    }
  }, [fechaInicio, fechaFin, size]);

  useEffect(() => {
    if (isOpen && fechaInicio && fechaFin) {
      fetchReports(0);
    }
  }, [isOpen, fechaInicio, fechaFin, fetchReports]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchReports(0);
  };

  const getNombreMes = (numMes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numMes - 1] || 'Mes Desconocido';
  };

  const formatCurrency = (val, cur = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = (r) => {
    if (!r) return;
    const rows = [
      ["REPORTE DE PRE-NOMINA - CLARA SAAS", ""],
      ["Colaborador", r.empleadoNombre],
      ["Periodo", `${getNombreMes(r.mesPeriodo)} ${r.anioPeriodo}`],
      ["Estado", r.estadoReporte],
      ["Fecha Generación", new Date(r.generadoEl).toLocaleDateString()],
      [],
      ["Concepto", "Valor"],
      ["Días Trabajados Efectivos", r.diasTrabajadosEfectivos],
      ["Días Falta Injustificada", r.diasFaltaInjustificada],
      ["Horas Extras Diurnas", r.horasExtrasDiurnasTotales],
      ["Horas Extras Nocturnas", r.horasExtrasNocturnasTotales],
      ["Salario Base Proporcional", r.montoSalarioBaseProporcional],
      ["Ganancia Extras", r.montoGananciaExtras],
      ["Deducciones Faltas", r.montoDeduccionesFaltas],
      ["Total Neto a Pagar", r.montoNetoPagar]
    ];

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `prenomina_${getNombreMes(r.mesPeriodo).toLowerCase()}_${r.anioPeriodo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-150 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-200 flex items-center justify-center text-[#1ba0f2]">
              <Receipt className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-4xs font-mono font-black text-slate-400 uppercase tracking-widest">Portal Colaborador</span>
              <h3 className="text-md font-extrabold text-[#0f2942] uppercase tracking-wide mt-0.5">
                Mis Reportes de Pre-Nómina
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <form onSubmit={handleSearch} className="p-4 bg-slate-50/20 border-b border-slate-150 flex flex-col sm:flex-row gap-4 items-end text-3xs font-bold uppercase tracking-wider text-slate-500">
          <div className="space-y-1 w-full sm:w-auto">
            <label className="block text-slate-400 font-bold">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1 w-full sm:w-auto">
            <label className="block text-slate-400 font-bold">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto rounded-xl bg-[#0f2942] hover:bg-[#153a5c] text-white py-2 px-5 text-3xs font-extrabold uppercase tracking-widest transition duration-150 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 font-semibold text-xs text-slate-700 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-5xs font-black uppercase text-red-750 border border-red-250 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#1ba0f2]" />
              <span className="text-4xs font-black uppercase tracking-wider text-slate-400">Buscando pre-nóminas...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              <span className="block font-bold">Sin reportes en este rango</span>
              <span className="block text-4xs text-slate-450 mt-1 font-semibold">No se encontraron pre-nóminas generadas entre las fechas seleccionadas.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Side: Report List */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-3xs font-black text-[#0f2942] uppercase tracking-wider pb-1">Periodos Disponibles</h4>
                <div className="space-y-2">
                  {reports.map((r) => {
                    const isSelected = selectedReport?.id === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedReport(r)}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                          isSelected 
                            ? 'border-[#1ba0f2] bg-sky-50/20 shadow-xs'
                            : 'border-slate-150 bg-white hover:bg-slate-50/40'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-4xs text-slate-400 font-extrabold uppercase tracking-widest block">Periodo</span>
                            <span className="text-xs font-black text-[#0f2942] block mt-0.5">
                              {getNombreMes(r.mesPeriodo)} - {r.anioPeriodo}
                            </span>
                          </div>
                          <span className="rounded-full px-2 py-0.5 text-5xs font-black uppercase tracking-wider border border-slate-200 bg-slate-50 text-slate-650">
                            {r.estadoReporte}
                          </span>
                        </div>
                        <div className="mt-3 flex justify-between items-end border-t border-slate-100 pt-2 text-3xs">
                          <div>
                            <span className="text-slate-400 font-bold block">Neto Estimado</span>
                            <span className="font-mono font-black text-[#0f2942]">{formatCurrency(r.montoNetoPagar)}</span>
                          </div>
                          <span className="text-5xs font-black text-[#1ba0f2] uppercase tracking-wider flex items-center gap-1">
                            <Eye className="h-3 w-3" /> Ver Detalle
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between text-5xs font-black uppercase tracking-widest text-slate-450 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      disabled={page === 0}
                      onClick={() => fetchReports(page - 1)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <span>{page + 1} / {totalPages}</span>
                    <button
                      type="button"
                      disabled={page >= totalPages - 1}
                      onClick={() => fetchReports(page + 1)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer"
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side: Selected Report Detail */}
              <div className="lg:col-span-7">
                {selectedReport ? (
                  <div className="bg-slate-50/30 border border-slate-150 rounded-2xl p-5 md:p-6 space-y-5">
                    
                    {/* Header Details */}
                    <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                      <div>
                        <h4 className="text-xs font-black text-[#0f2942] uppercase tracking-wide">
                          Detalle Pre-Nómina {getNombreMes(selectedReport.mesPeriodo)} {selectedReport.anioPeriodo}
                        </h4>
                        <span className="text-5xs text-slate-400 font-mono">Generado el: {new Date(selectedReport.generadoEl).toLocaleDateString()}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleExportCSV(selectedReport)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-white hover:text-emerald-600 hover:border-emerald-300 transition flex items-center gap-1 text-5xs font-black uppercase tracking-wider cursor-pointer"
                        title="Descargar Reporte"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Exportar</span>
                      </button>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 text-3xs font-semibold">
                      <div className="bg-white border border-slate-150/60 p-3 rounded-xl">
                        <span className="text-slate-400 uppercase block">Días Liquidados</span>
                        <span className="text-xs font-extrabold text-[#0f2942] block mt-0.5">{selectedReport.diasTrabajadosEfectivos} Días</span>
                      </div>
                      <div className="bg-white border border-slate-150/60 p-3 rounded-xl">
                        <span className="text-slate-400 uppercase block">Horas Extras</span>
                        <span className="text-xs font-extrabold text-[#0f2942] block mt-0.5">
                          {(selectedReport.horasExtrasDiurnasTotales + selectedReport.horasExtrasNocturnasTotales).toFixed(1)} h
                        </span>
                      </div>
                    </div>

                    {/* Breakdown List */}
                    <div className="bg-white border border-slate-150 rounded-xl overflow-hidden text-3xs">
                      <div className="p-3 bg-slate-50/50 border-b border-slate-150 text-4xs font-black uppercase text-slate-450 tracking-wider">Conceptos Liquidados</div>
                      <div className="divide-y divide-slate-100 px-3">
                        <div className="py-2.5 flex justify-between">
                          <span className="text-slate-500 font-medium">Salario Base Proporcional</span>
                          <span className="font-mono font-bold text-[#0f2942]">{formatCurrency(selectedReport.montoSalarioBaseProporcional)}</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-slate-500 font-medium">Recargo por Horas Extras</span>
                          <span className="font-mono font-bold text-emerald-600">+{formatCurrency(selectedReport.montoGananciaExtras)}</span>
                        </div>
                        <div className="py-2.5 flex justify-between">
                          <span className="text-rose-700 font-bold">Deducción por Faltas</span>
                          <span className="font-mono font-bold text-rose-650">-{formatCurrency(selectedReport.montoDeduccionesFaltas)}</span>
                        </div>
                      </div>
                      <div className="p-3 bg-[#1ba0f2]/5 border-t border-slate-150 flex justify-between items-center text-xs font-black text-[#0f2942]">
                        <span className="uppercase">Neto Estimado a Pagar:</span>
                        <span className="font-mono text-sm text-[#1ba0f2]">{formatCurrency(selectedReport.montoNetoPagar)}</span>
                      </div>
                    </div>

                    {/* Warnings */}
                    {selectedReport.requiereRecalculo && (
                      <div className="rounded-xl border border-amber-250 bg-amber-50/40 p-3 flex gap-2 text-amber-800 text-[10px] font-semibold">
                        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Este reporte requiere recálculo debido a modificaciones posteriores en la asistencia o el contrato. Contacte a RRHH.</span>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <span>Seleccione una pre-nómina a la izquierda para ver su desglose contable.</span>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex justify-end font-bold text-4xs uppercase tracking-wider">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-550 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
