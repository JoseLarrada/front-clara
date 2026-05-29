import { useState, useEffect } from 'react';
import { X, Palmtree, ShieldAlert, Loader2, Calendar } from 'lucide-react';

function VacacionesModal({
  isOpen,
  onClose,
  onSubmit,
  employees,
  loadingEmployees,
  apiError,
  actionLoading
}) {
  const [formData, setFormData] = useState({
    empleadoId: '',
    fechaInicio: '',
    fechaFin: ''
  });

  const [localError, setLocalError] = useState('');

  // Pre-load dates: tomorrow and 7 days later
  useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];

      const weekLater = new Date();
      weekLater.setDate(weekLater.getDate() + 8);
      const weekLaterStr = weekLater.toISOString().split('T')[0];

      setFormData({
        empleadoId: employees.length > 0 ? employees[0].id : '',
        fechaInicio: tomorrowStr,
        fechaFin: weekLaterStr
      });
      setLocalError('');
    }
  }, [isOpen, employees]);

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

    if (!formData.empleadoId) {
      setLocalError('Debe seleccionar un colaborador.');
      return;
    }
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
      setLocalError('La fecha de finalización debe ser posterior o igual a la fecha de inicio.');
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
            <Palmtree className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              Registrar Vacaciones
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Ingrese una solicitud de periodo vacacional en nombre del colaborador
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
          
          {/* Empleado Dropdown */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Colaborador</label>
            {loadingEmployees ? (
              <div className="h-9 w-full bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                name="empleadoId"
                value={formData.empleadoId}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
              >
                <option value="">Seleccione un colaborador...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombreCompleto} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Inicio */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Fecha de Inicio
              </label>
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
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Fecha de Término
              </label>
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
              Registrar Solicitud
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default VacacionesModal;
