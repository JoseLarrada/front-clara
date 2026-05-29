import { useState, useEffect } from 'react';
import { DollarSign, Save, ShieldAlert, CheckCircle, Percent, Info, Loader2 } from 'lucide-react';

function SurchargesForm({
  surcharges,
  loading,
  actionLoading,
  error,
  success,
  onSave
}) {
  const [formData, setFormData] = useState({
    factorHoraExtraDiurna: 1.25,
    factorHoraExtraNocturna: 1.75,
    factorHoraDominicalFestiva: 2.00,
    multaRetardoPorMinuto: 500.00
  });

  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (surcharges) {
      setFormData({
        factorHoraExtraDiurna: surcharges.factorHoraExtraDiurna || 1.25,
        factorHoraExtraNocturna: surcharges.factorHoraExtraNocturna || 1.75,
        factorHoraDominicalFestiva: surcharges.factorHoraDominicalFestiva || 2.00,
        multaRetardoPorMinuto: surcharges.multaRetardoPorMinuto !== undefined ? surcharges.multaRetardoPorMinuto : 500.00
      });
    }
  }, [surcharges]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const diurna = Number(formData.factorHoraExtraDiurna);
    const nocturna = Number(formData.factorHoraExtraNocturna);
    const dominical = Number(formData.factorHoraDominicalFestiva);
    const multa = Number(formData.multaRetardoPorMinuto);

    // Validations based on API contract
    if (isNaN(diurna) || diurna < 1.0 || diurna > 3.0) {
      setLocalError('El factor de hora extra diurna debe estar entre 1.0 y 3.0.');
      return;
    }
    if (isNaN(nocturna) || nocturna < 1.0 || nocturna > 3.0) {
      setLocalError('El factor de hora extra nocturna debe estar entre 1.0 y 3.0.');
      return;
    }
    if (isNaN(dominical) || dominical < 1.0 || dominical > 3.0) {
      setLocalError('El factor dominical y festivo debe estar entre 1.0 y 3.0.');
      return;
    }
    if (isNaN(multa) || multa < 0.0 || multa > 999999.99) {
      setLocalError('La multa por retardo debe ser un valor positivo válido (máximo $999,999.99).');
      return;
    }

    onSave(formData);
  };

  const activeError = localError || error;

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-150 bg-white p-12 shadow-sm text-center">
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
          <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Cargando recargos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700 max-w-2xl mx-auto">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Percent className="h-4.5 w-4.5 text-[#1ba0f2]" /> Políticas de Recargos y Multas
        </h3>
        <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Configure los factores financieros de horas extras y multas por retardo</p>
      </div>

      <div className="p-6">
        {/* Alerts */}
        {activeError && (
          <div className="mb-5 rounded-xl bg-red-50 p-3.5 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl bg-emerald-50 p-3.5 text-2xs font-bold text-emerald-750 border border-emerald-200 flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
            <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Políticas guardadas correctamente. Los cambios se aplicarán en el cálculo de la próxima pre-nómina.</span>
          </div>
        )}

        {(!surcharges || !surcharges.id) && !activeError && !success && (
          <div className="mb-5 rounded-xl bg-[#1ba0f2]/5 p-3.5 text-2xs font-bold text-[#0f2942] border border-[#1ba0f2]/20 flex items-start gap-2.5 animate-in fade-in duration-200">
            <Info className="h-4.5 w-4.5 text-[#1ba0f2] flex-shrink-0 mt-0.5" />
            <div>
              <span className="block font-black text-[#1ba0f2]">Configuración Inicial</span>
              <span className="mt-1 block text-slate-500 font-semibold leading-normal">
                Esta empresa aún no cuenta con políticas de recargo guardadas en la base de datos. Puede revisar los valores sugeridos a continuación y presionar <strong>Crear Políticas</strong> para registrarlos.
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Factor Extra Diurna */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Hora Extra Diurna (Factor)</label>
                <div className="group relative cursor-pointer">
                  <Info className="h-3.5 w-3.5 text-slate-350 hover:text-[#1ba0f2]" />
                  <span className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 rounded bg-slate-800 p-2 text-5xs leading-tight text-white opacity-0 transition group-hover:opacity-100 shadow-md">
                    Multiplicador base para horas laboradas fuera del turno diurno regular (ej. 1.25 representa 25% de recargo). Rango: 1.0 a 3.0.
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="factorHoraExtraDiurna"
                  value={formData.factorHoraExtraDiurna}
                  onChange={handleChange}
                  disabled={actionLoading}
                  min="1.0"
                  max="3.0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-extrabold text-3xs">
                  x
                </div>
              </div>
            </div>

            {/* Factor Extra Nocturna */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Hora Extra Nocturna (Factor)</label>
                <div className="group relative cursor-pointer">
                  <Info className="h-3.5 w-3.5 text-slate-350 hover:text-[#1ba0f2]" />
                  <span className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 rounded bg-slate-800 p-2 text-5xs leading-tight text-white opacity-0 transition group-hover:opacity-100 shadow-md">
                    Multiplicador base para horas laboradas durante el turno nocturno (ej. 1.75 representa 75% de recargo). Rango: 1.0 a 3.0.
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="factorHoraExtraNocturna"
                  value={formData.factorHoraExtraNocturna}
                  onChange={handleChange}
                  disabled={actionLoading}
                  min="1.0"
                  max="3.0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-extrabold text-3xs">
                  x
                </div>
              </div>
            </div>

            {/* Factor Dominical/Festivo */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Dominical y Festivo (Factor)</label>
                <div className="group relative cursor-pointer">
                  <Info className="h-3.5 w-3.5 text-slate-350 hover:text-[#1ba0f2]" />
                  <span className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 rounded bg-slate-800 p-2 text-5xs leading-tight text-white opacity-0 transition group-hover:opacity-100 shadow-md">
                    Multiplicador base para horas trabajadas en domingos o feriados nacionales (ej. 2.00 representa el doble de pago). Rango: 1.0 a 3.0.
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="factorHoraDominicalFestiva"
                  value={formData.factorHoraDominicalFestiva}
                  onChange={handleChange}
                  disabled={actionLoading}
                  min="1.0"
                  max="3.0"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-extrabold text-3xs">
                  x
                </div>
              </div>
            </div>

            {/* Multa Retardo por Minuto */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Multa Retardo por Minuto</label>
                <div className="group relative cursor-pointer">
                  <Info className="h-3.5 w-3.5 text-slate-350 hover:text-[#1ba0f2]" />
                  <span className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 rounded bg-slate-800 p-2 text-5xs leading-tight text-white opacity-0 transition group-hover:opacity-100 shadow-md">
                    Deducción monetaria aplicada al empleado por cada minuto excedido tras el límite de tolerancia de entrada.
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  name="multaRetardoPorMinuto"
                  value={formData.multaRetardoPorMinuto}
                  onChange={handleChange}
                  disabled={actionLoading}
                  min="0.0"
                  max="999999.99"
                  step="0.01"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-xs font-mono font-bold focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-455">
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="flex justify-end border-t border-slate-100 pt-5 mt-6">
            <button
              type="submit"
              disabled={actionLoading}
              className="w-full sm:w-auto rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-2.5 px-6 font-bold shadow-md shadow-[#1ba0f2]/10 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {surcharges && surcharges.id ? 'Actualizar Políticas' : 'Crear Políticas'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}

export default SurchargesForm;
