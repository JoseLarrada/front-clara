import { Calendar, Users, Calculator, Download, Play, HelpCircle, FileSpreadsheet } from 'lucide-react';

function PrenominaFilters({
  fechaInicio,
  onFechaInicioChange,
  fechaFin,
  onFechaFinChange,
  empleadoId,
  onEmpleadoIdChange,
  isSimulation,
  onIsSimulationChange,
  employees,
  loadingEmployees,
  onCalculate,
  onExport,
  loading,
  hasResults
}) {
  return (
    <div className="rounded-3xl border border-slate-150 bg-white p-5 shadow-sm text-left font-semibold text-xs text-slate-700 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        
        {/* Fecha Inicio */}
        <div className="space-y-1">
          <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" /> Fecha Inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => onFechaInicioChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
          />
        </div>

        {/* Fecha Fin */}
        <div className="space-y-1">
          <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-400" /> Fecha Fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => onFechaFinChange(e.target.value)}
            disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
          />
        </div>

        {/* Empleado Selector */}
        <div className="space-y-1">
          <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Users className="h-3 w-3 text-slate-400" /> Colaborador
          </label>
          {loadingEmployees ? (
            <div className="h-9 w-full bg-slate-100 animate-pulse rounded-xl" />
          ) : (
            <select
              value={empleadoId}
              onChange={(e) => onEmpleadoIdChange(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
            >
              <option value="">Todos los colaboradores</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombreCompleto}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Action button */}
        <div>
          <button
            type="button"
            onClick={onCalculate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#1ba0f2]/10 transition cursor-pointer disabled:opacity-50"
          >
            <Calculator className="h-4 w-4" />
            {isSimulation ? 'Simular Pre-nómina' : 'Generar Reporte'}
          </button>
        </div>

      </div>

      {/* Row with Toggle check & Export buttons if results are present */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-4 gap-4">
        
        {/* Toggle Mode */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onIsSimulationChange(!isSimulation)}
            className={`relative inline-flex h-5.5 w-10.5 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isSimulation ? 'bg-[#1ba0f2]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isSimulation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="text-left leading-tight">
            <span className="block font-bold text-[#0f2942]">
              {isSimulation ? 'Modo Previsualización (En memoria)' : 'Modo Cierre Persistente (Guardar en BD)'}
            </span>
            <span className="text-4xs text-slate-450 uppercase font-mono">
              {isSimulation ? 'Simula sin alterar base de datos' : 'Almacena un registro histórico en estado borrador'}
            </span>
          </div>
        </div>

        {/* Exporters panel */}
        {hasResults && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-4xs text-slate-400 font-bold uppercase tracking-wider hidden md:inline">Exportar periodo:</span>
            
            <button
              type="button"
              onClick={() => onExport('csv')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 hover:border-[#1ba0f2]/40 hover:bg-[#1ba0f2]/5 px-3 py-1.5 text-3xs font-extrabold uppercase tracking-wide text-slate-600 hover:text-[#1ba0f2] transition cursor-pointer"
            >
              CSV
            </button>
            <button
              type="button"
              onClick={() => onExport('excel')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 px-3 py-1.5 text-3xs font-extrabold uppercase tracking-wide text-slate-600 hover:text-emerald-600 transition cursor-pointer"
            >
              EXCEL
            </button>
            <button
              type="button"
              onClick={() => onExport('pdf')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 hover:border-red-400 hover:bg-red-50 px-3 py-1.5 text-3xs font-extrabold uppercase tracking-wide text-slate-600 hover:text-red-650 transition cursor-pointer"
            >
              PDF
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default PrenominaFilters;
