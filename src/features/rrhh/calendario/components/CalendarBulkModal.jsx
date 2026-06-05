import { useState, useEffect } from 'react';
import { X, Calendar, ShieldAlert, Loader2, Play } from 'lucide-react';

function CalendarBulkModal({
  isOpen,
  onClose,
  onSubmit,
  actionLoading,
  apiError
}) {
  const [formData, setFormData] = useState({
    fechaInicio: '',
    fechaFin: '',
    caracterDia: 'REMOTO',
    repeticion: 'NINGUNA',
    diasSemana: [1, 2, 3, 4, 5] // default Mon-Fri
  });

  const [localError, setLocalError] = useState('');

  const diasOpciones = [
    { label: 'L', value: 1, name: 'Lunes' },
    { label: 'M', value: 2, name: 'Martes' },
    { label: 'M', value: 3, name: 'Miércoles' },
    { label: 'J', value: 4, name: 'Jueves' },
    { label: 'V', value: 5, name: 'Viernes' },
    { label: 'S', value: 6, name: 'Sábado' },
    { label: 'D', value: 0, name: 'Domingo' }
  ];

  // Pre-load dates: tomorrow and 7 days later
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 7);
      const weekLaterStr = weekLater.toISOString().split('T')[0];

      setFormData({
        fechaInicio: tomorrowStr,
        fechaFin: weekLaterStr,
        caracterDia: 'REMOTO',
        repeticion: 'NINGUNA',
        diasSemana: [1, 2, 3, 4, 5]
      });
      setLocalError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
  };

  const toggleDiaSemana = (dayVal) => {
    setFormData(prev => {
      const current = prev.diasSemana;
      const next = current.includes(dayVal)
        ? current.filter(d => d !== dayVal)
        : [...current, dayVal];
      return {
        ...prev,
        diasSemana: next
      };
    });
    if (localError) setLocalError('');
  };

  const getResumenRegla = () => {
    const { fechaInicio, fechaFin, caracterDia, repeticion, diasSemana } = formData;
    if (!fechaInicio || !fechaFin) return '';

    const labelModalidad = caracterDia === 'SIN_ASIGNAR' 
      ? 'SIN ASIGNAR (Limpiar jornada)' 
      : caracterDia;

    let patternDesc = '';
    if (repeticion === 'NINGUNA') {
      patternDesc = 'todos los días del rango';
    } else if (repeticion === 'DIARIA') {
      patternDesc = 'diariamente (todos los días)';
    } else if (repeticion === 'LABORAL') {
      patternDesc = 'de lunes a viernes';
    } else if (repeticion === 'FIN_SEMANA') {
      patternDesc = 'los fines de semana (sábados y domingos)';
    } else if (repeticion === 'SEMANAL') {
      if (diasSemana.length === 0) {
        return 'Seleccione al menos un día de la semana para la repetición.';
      }
      const nombresDias = diasSemana
        .map(val => diasOpciones.find(d => d.value === val)?.name)
        .filter(Boolean)
        .join(', ');
      patternDesc = `semanalmente los días: ${nombresDias}`;
    } else if (repeticion === 'CADA_DOS_SEMANAS') {
      if (diasSemana.length === 0) {
        return 'Seleccione al menos un día de la semana para la repetición.';
      }
      const nombresDias = diasSemana
        .map(val => diasOpciones.find(d => d.value === val)?.name)
        .filter(Boolean)
        .join(', ');
      patternDesc = `cada 2 semanas los días: ${nombresDias}`;
    }

    return `Se establecerá la modalidad ${labelModalidad} ${patternDesc} desde el ${fechaInicio} hasta el ${fechaFin}.`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.fechaInicio) {
      setLocalError('La fecha de inicio es obligatoria.');
      return;
    }
    if (!formData.fechaFin) {
      setLocalError('La fecha de finalización es obligatoria.');
      return;
    }

    const start = new Date(formData.fechaInicio + 'T00:00:00');
    const end = new Date(formData.fechaFin + 'T00:00:00');

    if (end < start) {
      setLocalError('La fecha de finalización debe ser posterior o igual a la de inicio.');
      return;
    }

    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 180) {
      setLocalError('El rango de fechas no puede superar los 6 meses (180 días) por motivos de seguridad y rendimiento.');
      return;
    }

    if ((formData.repeticion === 'SEMANAL' || formData.repeticion === 'CADA_DOS_SEMANAS') && formData.diasSemana.length === 0) {
      setLocalError('Debe seleccionar al menos un día de la semana para la repetición.');
      return;
    }

    onSubmit(formData);
  };

  const activeError = localError || apiError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0f2942]/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10 text-left font-semibold text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              Asignación Masiva
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Defina modalidades de trabajo en lote para un rango de fechas
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Inicio */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Fecha Inicio</label>
              <input
                type="date"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer font-bold text-slate-700"
              />
            </div>

            {/* Fecha Fin */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Fecha Fin</label>
              <input
                type="date"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Patrón de Repetición Selector */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Repetición / Periodicidad</label>
            <select
              name="repeticion"
              value={formData.repeticion}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
            >
              <option value="NINGUNA">No repetir (Rango continuo)</option>
              <option value="DIARIA">Diariamente (Todos los días)</option>
              <option value="LABORAL">Lunes a Viernes</option>
              <option value="FIN_SEMANA">Sábados y Domingos</option>
              <option value="SEMANAL">Semanalmente...</option>
              <option value="CADA_DOS_SEMANAS">Cada 2 semanas...</option>
            </select>
          </div>

          {/* Selector de días de la semana (condicional) */}
          {(formData.repeticion === 'SEMANAL' || formData.repeticion === 'CADA_DOS_SEMANAS') && (
            <div className="space-y-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-150 animate-in fade-in slide-in-from-top-1 duration-150 text-left">
              <label className="block text-4xs font-extrabold text-slate-450 uppercase tracking-widest leading-none">Días a repetir</label>
              <div className="flex gap-2 justify-between">
                {diasOpciones.map(dia => {
                  const active = formData.diasSemana.includes(dia.value);
                  return (
                    <button
                      key={dia.value}
                      type="button"
                      onClick={() => toggleDiaSemana(dia.value)}
                      disabled={actionLoading}
                      className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all cursor-pointer ${
                        active
                          ? 'bg-[#1ba0f2] border-[#1ba0f2] text-white shadow-sm shadow-[#1ba0f2]/30 scale-105'
                          : 'bg-white border-slate-250 text-slate-500 hover:bg-slate-100'
                      }`}
                      title={dia.name}
                    >
                      {dia.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Modalidad Selector */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Modalidad Laboral Asignada</label>
            <select
              name="caracterDia"
              value={formData.caracterDia}
              onChange={handleChange}
              disabled={actionLoading}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
            >
              <option value="REMOTO">REMOTO (Celular / App)</option>
              <option value="PRESENCIAL">PRESENCIAL (Oficina)</option>
              <option value="SIN_ASIGNAR">SIN ASIGNAR (Limpiar jornada)</option>
            </select>
          </div>

          {/* Summary Panel */}
          {formData.fechaInicio && formData.fechaFin && (
            <div className="bg-[#1ba0f2]/5 border border-[#1ba0f2]/10 rounded-2xl p-4 flex gap-3 text-left animate-in fade-in duration-200">
              <Play className="h-4.5 w-4.5 text-[#1ba0f2] rotate-90 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-4xs text-[#1ba0f2] uppercase tracking-wider font-extrabold">Resumen de Programación</strong>
                <p className="mt-1 text-slate-550 font-semibold text-3xs leading-relaxed">
                  {getResumenRegla()}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-650 bg-white py-2.5 px-5 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-2.5 px-6 font-bold shadow-md shadow-[#1ba0f2]/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar en Lote
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default CalendarBulkModal;
