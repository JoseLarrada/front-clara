import { useState, useEffect } from 'react';
import { X, Clock, ShieldAlert, Loader2 } from 'lucide-react';

function RuleModal({ isOpen, onClose, onSubmit, activeRule, apiError, actionLoading }) {
  const [formData, setFormData] = useState({
    descripcion: '',
    horaEntradaOficial: '08:00',
    horaSalidaOficial: '17:00',
    minutosToleranciaRetardo: 15,
    tiempoLimiteFaltaMinutos: 120
  });
  
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (activeRule) {
      // Tomar los primeros 5 caracteres "HH:mm" del formato "HH:mm:ss" para el input nativo de hora
      const formatTimeInput = (timeStr) => {
        if (!timeStr) return '08:00';
        return timeStr.substring(0, 5);
      };

      setFormData({
        descripcion: activeRule.descripcion || '',
        horaEntradaOficial: formatTimeInput(activeRule.horaEntradaOficial),
        horaSalidaOficial: formatTimeInput(activeRule.horaSalidaOficial),
        minutosToleranciaRetardo: activeRule.minutosToleranciaRetardo !== undefined ? activeRule.minutosToleranciaRetardo : 15,
        tiempoLimiteFaltaMinutos: activeRule.tiempoLimiteFaltaMinutos !== undefined ? activeRule.tiempoLimiteFaltaMinutos : 120
      });
    } else {
      setFormData({
        descripcion: '',
        horaEntradaOficial: '08:00',
        horaSalidaOficial: '17:00',
        minutosToleranciaRetardo: 15,
        tiempoLimiteFaltaMinutos: 120
      });
    }
    setLocalError('');
  }, [activeRule, isOpen]);

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
    
    // Validaciones
    if (!formData.descripcion.trim()) {
      setLocalError('La descripción de la jornada es obligatoria.');
      return;
    }
    if (!formData.horaEntradaOficial) {
      setLocalError('La hora de entrada es obligatoria.');
      return;
    }
    if (!formData.horaSalidaOficial) {
      setLocalError('La hora de salida es obligatoria.');
      return;
    }
    if (Number(formData.minutosToleranciaRetardo) < 0 || Number(formData.minutosToleranciaRetardo) > 480) {
      setLocalError('Los minutos de tolerancia deben estar entre 0 y 480 minutos.');
      return;
    }
    if (Number(formData.tiempoLimiteFaltaMinutos) < 1 || Number(formData.tiempoLimiteFaltaMinutos) > 1440) {
      setLocalError('El tiempo límite de inasistencia debe estar entre 1 y 1440 minutos.');
      return;
    }

    // Adaptar horas a formato "HH:mm:ss" requerido por el contrato
    onSubmit({
      ...formData,
      horaEntradaOficial: `${formData.horaEntradaOficial}:00`,
      horaSalidaOficial: `${formData.horaSalidaOficial}:00`
    });
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
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              {activeRule ? 'Editar Jornada' : 'Registrar Jornada'}
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              {activeRule ? 'Modifique los límites de tolerancia y turnos' : 'Registre una nueva jornada laboral asignable'}
            </p>
          </div>
        </div>

        {/* Error */}
        {activeError && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Descripción del Turno</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={actionLoading}
              placeholder="Ej: Jornada Administrativa General"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hora entrada */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Hora Entrada Oficial</label>
              <input
                type="time"
                name="horaEntradaOficial"
                value={formData.horaEntradaOficial}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
              />
            </div>

            {/* Hora salida */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Hora Salida Oficial</label>
              <input
                type="time"
                name="horaSalidaOficial"
                value={formData.horaSalidaOficial}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tolerancia */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Tolerancia Retardo (Min)</label>
              <input
                type="number"
                name="minutosToleranciaRetardo"
                value={formData.minutosToleranciaRetardo}
                onChange={handleChange}
                disabled={actionLoading}
                min="0"
                max="480"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>

            {/* Tiempo límite falta */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Límite Falta Automática (Min)</label>
              <input
                type="number"
                name="tiempoLimiteFaltaMinutos"
                value={formData.tiempoLimiteFaltaMinutos}
                onChange={handleChange}
                disabled={actionLoading}
                min="1"
                max="1440"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
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
              {activeRule ? 'Guardar Cambios' : 'Registrar Jornada'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default RuleModal;
