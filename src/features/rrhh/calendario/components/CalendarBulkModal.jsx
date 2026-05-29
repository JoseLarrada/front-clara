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
    caracterDia: 'REMOTO'
  });

  const [localError, setLocalError] = useState('');

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
        caracterDia: 'REMOTO'
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

    const start = new Date(formData.fechaInicio);
    const end = new Date(formData.fechaFin);

    if (end < start) {
      setLocalError('La fecha de finalización debe ser posterior o igual a la de inicio.');
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
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
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
              />
            </div>
          </div>

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
            </select>
          </div>

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
