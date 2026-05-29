import RRHHLayout from '../../common/components/RRHHLayout';
import PrenominaFilters from '../components/PrenominaFilters';
import PrenominaTable from '../components/PrenominaTable';
import PrenominaReceipt from '../components/PrenominaReceipt';
import HistoricalReportsList from '../components/HistoricalReportsList';
import { usePrenomina } from '../hooks/usePrenomina';
import { Settings, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

function PrenominaPage() {
  const {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    empleadoId,
    setEmpleadoId,
    isSimulation,
    setIsSimulation,
    results,
    historicalReports,
    employees,
    pagination,
    loading,
    loadingHistory,
    loadingEmployees,
    actionLoading,
    apiError,
    success,
    handlePageChange,
    handleCalculate,
    handleExport,
    refetchHistory
  } = usePrenomina();

  // Determine whether to display a detailed single receipt or a consolidated table
  const showReceipt = empleadoId && results.length > 0;

  // Mock individual download handler for past reports in historical list
  const handleExportPastReport = (type, report) => {
    alert(`Descargando reporte de pre-nómina en formato ${type.toUpperCase()} para ${report.empleadoNombre} (Periodo: ${report.mesPeriodo}/${report.anioPeriodo}).`);
  };

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Settings className="h-3 w-3" /> Consola de Reportes y Pre-Nómina
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
            Cierre de Pre-Nómina
          </h1>
          <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
            Simule cálculos salariales del periodo en curso o genere cierres definitivos con desglose de recargos financieros, horas extras y penalizaciones.
          </p>
        </div>

        {/* Global Notifications */}
        {apiError && (
          <div className="rounded-xl bg-red-50 p-3.5 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2.5 text-left">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 p-3.5 text-2xs font-bold text-emerald-750 border border-emerald-200 flex items-start gap-2.5 text-left animate-in fade-in slide-in-from-top-1 duration-150">
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>El reporte de pre-nómina del periodo seleccionado ha sido guardado exitosamente en estado BORRADOR.</span>
          </div>
        )}

        {/* Filters Panel */}
        <PrenominaFilters
          fechaInicio={fechaInicio}
          onFechaInicioChange={setFechaInicio}
          fechaFin={fechaFin}
          onFechaFinChange={setFechaFin}
          empleadoId={empleadoId}
          onEmpleadoIdChange={setEmpleadoId}
          isSimulation={isSimulation}
          onIsSimulationChange={setIsSimulation}
          employees={employees}
          loadingEmployees={loadingEmployees}
          onCalculate={handleCalculate}
          onExport={handleExport}
          loading={loading}
          hasResults={results.length > 0}
        />

        {/* Computation Results Panel */}
        {results.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="text-left">
              <h2 className="text-lg font-black text-[#0f2942] tracking-tight">
                {isSimulation ? 'Previsualización de Resultados' : 'Cierre de Periodo Generado'}
              </h2>
              <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">
                {isSimulation 
                  ? 'Cálculos aritméticos temporales simulados del mes' 
                  : 'Cierre registrado formalmente en la base de datos'
                }
              </p>
            </div>

            {showReceipt ? (
              <PrenominaReceipt data={results[0]} />
            ) : (
              <PrenominaTable results={results} loading={loading} />
            )}
          </div>
        )}

        {/* Historical Closed Runs Panel */}
        <div className="space-y-4 border-t border-slate-200 pt-8 mt-12">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h2 className="text-lg font-black text-[#0f2942] tracking-tight">Reportes Históricos Persistidos</h2>
              <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1">Cierres guardados en base de datos para contabilidad</p>
            </div>
            
            <button
              type="button"
              onClick={refetchHistory}
              disabled={loadingHistory}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
              title="Actualizar histórico"
            >
              <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <HistoricalReportsList
            reports={historicalReports}
            pagination={pagination}
            loading={loadingHistory}
            onPageChange={handlePageChange}
            onExportReport={handleExportPastReport}
          />
        </div>

      </div>
    </RRHHLayout>
  );
}

export default PrenominaPage;
