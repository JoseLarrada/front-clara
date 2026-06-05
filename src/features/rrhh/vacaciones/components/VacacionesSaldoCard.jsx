import { useState } from 'react';
import { Search, Loader2, Sparkles, AlertCircle, Plus, Minus, Check, X, ShieldAlert } from 'lucide-react';
import { registrarAjusteVacaciones } from '../services/vacacionesService';

function VacacionesSaldoCard({
  employees,
  selectedId,
  onSelectedIdChange,
  checkedBalance,
  loadingBalance,
  onBalanceAdjusted
}) {
  const selectedEmp = employees.find(e => e.id === selectedId);

  const [isAdjusting, setIsAdjusting] = useState(false);
  const [cantidadDias, setCantidadDias] = useState(1);
  const [signo, setSigno] = useState(1); // 1 = suma, -1 = resta
  const [motivoAjuste, setMotivoAjuste] = useState('');
  const [loadingAjuste, setLoadingAjuste] = useState(false);
  const [ajusteError, setAjusteError] = useState('');
  const [ajusteSuccess, setAjusteSuccess] = useState(false);

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

  const handleAjustar = async (e) => {
    e.preventDefault();
    const valorDias = Number(cantidadDias) * signo;
    if (valorDias === 0) {
      setAjusteError('La cantidad de días debe ser diferente de cero.');
      return;
    }
    if (!motivoAjuste.trim()) {
      setAjusteError('El motivo del ajuste es obligatorio.');
      return;
    }

    setLoadingAjuste(true);
    setAjusteError('');

    try {
      await registrarAjusteVacaciones({
        empleadoId: selectedId,
        tipoMovimiento: 'AJUSTE_ADMIN',
        cantidadDias: valorDias,
        motivoAjuste: motivoAjuste.trim()
      });
      
      setAjusteSuccess(true);
      setMotivoAjuste('');
      setCantidadDias(1);
      setIsAdjusting(false);
      
      if (onBalanceAdjusted) {
        await onBalanceAdjusted();
      }
      setTimeout(() => setAjusteSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setAjusteError(err.response?.data?.message || 'Error al procesar el ajuste de vacaciones.');
    } finally {
      setLoadingAjuste(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700 max-w-md mx-auto h-full flex flex-col justify-between">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Search className="h-4.5 w-4.5 text-[#1ba0f2]" /> Consulta de Saldos y Ajustes
        </h3>
        <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Verifique o modifique el remanente transaccional (Ledger)</p>
      </div>

      <div className="p-6 space-y-5 flex-1 flex flex-col justify-center">
        {/* Dropdown Selector */}
        <div className="space-y-1.5">
          <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Seleccionar Colaborador</label>
          <select
            value={selectedId}
            onChange={(e) => {
              onSelectedIdChange(e.target.value);
              setIsAdjusting(false);
              setAjusteError('');
            }}
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
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-150 bg-slate-50/40 p-5 text-center flex flex-col items-center justify-center gap-3 min-h-[120px] relative">
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

            {/* Notifications */}
            {ajusteSuccess && (
              <div className="rounded-xl bg-emerald-50 p-3 text-5xs font-black uppercase text-emerald-700 border border-emerald-250 flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span>Ajuste registrado con éxito en el libro contable.</span>
              </div>
            )}

            {ajusteError && (
              <div className="rounded-xl bg-red-50 p-3 text-5xs font-black uppercase text-red-750 border border-red-250 flex items-center gap-2">
                <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                <span>{ajusteError}</span>
              </div>
            )}

            {/* Adjust options */}
            {!loadingBalance && checkedBalance !== null && (
              <div className="pt-1">
                {!isAdjusting ? (
                  <button
                    type="button"
                    onClick={() => setIsAdjusting(true)}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-[#1ba0f2] hover:bg-[#1ba0f2]/5 text-[#0f2942] hover:text-[#1ba0f2] font-bold text-xs tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Ajustar Saldo Manualmente
                  </button>
                ) : (
                  <form onSubmit={handleAjustar} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3.5 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-4xs font-bold text-slate-450 uppercase tracking-widest">Nuevo Movimiento de Ajuste</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdjusting(false);
                          setAjusteError('');
                        }}
                        className="text-slate-400 hover:text-slate-650 transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sign and Amount */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider mb-1">Acción</label>
                        <div className="flex rounded-xl border border-slate-250 overflow-hidden font-bold">
                          <button
                            type="button"
                            onClick={() => setSigno(1)}
                            className={`flex-1 py-1.5 flex items-center justify-center gap-1 transition ${signo === 1 ? 'bg-emerald-500 text-white' : 'bg-slate-55 hover:bg-slate-100 text-slate-600'}`}
                          >
                            <Plus className="h-3.5 w-3.5" /> Adicionar
                          </button>
                          <button
                            type="button"
                            onClick={() => setSigno(-1)}
                            className={`flex-1 py-1.5 flex items-center justify-center gap-1 transition ${signo === -1 ? 'bg-rose-500 text-white' : 'bg-slate-55 hover:bg-slate-100 text-slate-600'}`}
                          >
                            <Minus className="h-3.5 w-3.5" /> Deducir
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider mb-1">Días Hábiles</label>
                        <input
                          type="number"
                          min="1"
                          max="90"
                          value={cantidadDias}
                          onChange={(e) => setCantidadDias(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                        />
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1">
                      <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Motivo / Justificación</label>
                      <textarea
                        rows="2"
                        value={motivoAjuste}
                        onChange={(e) => setMotivoAjuste(e.target.value)}
                        placeholder="Ej. Ajuste por horas extras acumuladas..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none resize-none transition"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 font-bold text-4xs uppercase tracking-wider pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAdjusting(false);
                          setAjusteError('');
                        }}
                        className="flex-1 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-550 transition cursor-pointer text-center"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loadingAjuste}
                        className="flex-1 py-2 rounded-lg bg-[#0f2942] hover:bg-[#0f2942]/90 text-white transition cursor-pointer flex items-center justify-center gap-1"
                      >
                        {loadingAjuste ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Registrar Movimiento
                      </button>
                    </div>
                  </form>
                )}
              </div>
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
