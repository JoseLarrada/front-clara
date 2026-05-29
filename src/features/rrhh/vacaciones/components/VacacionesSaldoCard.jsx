import { Search, Loader2, Sparkles, AlertCircle } from 'lucide-react';

function VacacionesSaldoCard({
  employees,
  selectedId,
  onSelectedIdChange,
  checkedBalance,
  loadingBalance
}) {
  const selectedEmp = employees.find(e => e.id === selectedId);

  const getBalanceStatus = (days) => {
    if (days === null || days === undefined) return null;
    if (days >= 15) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-5xs font-black uppercase tracking-widest text-emerald-650">
          <Sparkles className="h-3 w-3" /> Saldo Excelente
        </span>
      );
    }
    if (days > 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-5xs font-black uppercase tracking-widest text-sky-650">
          Días Consumidos
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-5xs font-black uppercase tracking-widest text-red-650 animate-pulse">
        <AlertCircle className="h-3 w-3" /> Sin Días Disponibles
      </span>
    );
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700 max-w-md mx-auto h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Search className="h-4.5 w-4.5 text-[#1ba0f2]" /> Consulta Rápida de Saldos
        </h3>
        <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Verifique el remanente vacacional del colaborador</p>
      </div>

      <div className="p-6 space-y-5 flex-1 flex flex-col justify-center">
        {/* Dropdown Selector */}
        <div className="space-y-1.5">
          <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Seleccionar Colaborador</label>
          <select
            value={selectedId}
            onChange={(e) => onSelectedIdChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
          >
            {employees.length === 0 ? (
              <option value="">No hay colaboradores activos...</option>
            ) : (
              employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombreCompleto}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Display Balance area */}
        {selectedId ? (
          <div className="rounded-2xl border border-slate-150 bg-slate-50/40 p-5 text-center flex flex-col items-center justify-center gap-3 min-h-[140px] relative">
            {loadingBalance ? (
              <div className="flex flex-col items-center gap-1 text-slate-450">
                <Loader2 className="h-6 w-6 animate-spin text-[#1ba0f2]" />
                <span className="text-4xs font-bold uppercase tracking-widest mt-1">Consultando base...</span>
              </div>
            ) : checkedBalance !== null ? (
              <div className="space-y-2 animate-in fade-in duration-200">
                <span className="block text-4xl font-mono font-black text-[#0f2942]">
                  {checkedBalance}
                </span>
                <span className="block text-3xs font-extrabold text-slate-450 uppercase tracking-widest">
                  Días Hábiles Disponibles
                </span>
                <div className="pt-1">
                  {getBalanceStatus(checkedBalance)}
                </div>
              </div>
            ) : (
              <span className="text-slate-400">Error al cargar balance</span>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-slate-400 min-h-[140px] flex items-center justify-center">
            <span className="text-3xs uppercase font-bold">Elija un colaborador de la lista</span>
          </div>
        )}
      </div>

      {/* Info footer */}
      {selectedEmp && !loadingBalance && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/30 text-center text-4xs font-bold text-slate-400 uppercase tracking-wider font-mono truncate">
          ID: {selectedEmp.id}
        </div>
      )}

    </div>
  );
}

export default VacacionesSaldoCard;
