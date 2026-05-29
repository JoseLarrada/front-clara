import { useState, useEffect } from 'react';
import { X, MessageSquare, ShieldAlert, Loader2 } from 'lucide-react';

function JustificacionActionModal({
  isOpen,
  onClose,
  onSubmit,
  justificacion,
  actionType,
  apiError,
  actionLoading
}) {
  const [comments, setComments] = useState('');
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setComments('');
    setLocalError('');
  }, [justificacion, isOpen]);

  if (!isOpen || !justificacion) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    // Rejection requires comment
    if (actionType === 'reject' && !comments.trim()) {
      setLocalError('Debe ingresar un comentario justificando el rechazo de la solicitud.');
      return;
    }

    if (comments.length > 2000) {
      setLocalError('El comentario no puede superar los 2000 caracteres.');
      return;
    }

    onSubmit(comments);
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
      <div className="relative w-full max-w-md rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10 text-left font-semibold text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            actionType === 'approve' 
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
              : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              {actionType === 'approve' ? 'Aprobar Justificación' : 'Rechazar Justificación'}
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              {justificacion.empleadoNombre} &bull; Incidencia del {justificacion.fecha}
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

        {/* Employee details panel */}
        <div className="mb-5 p-3.5 bg-slate-50 rounded-xl border border-slate-150 text-2xs leading-relaxed text-slate-600 font-medium">
          <span className="block font-bold text-[#0f2942] uppercase tracking-wider text-4xs mb-1.5">Motivo del Empleado:</span>
          <p className="italic">"{justificacion.motivoEmpleado}"</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
              Comentarios del Administrador {actionType === 'reject' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => {
                setComments(e.target.value);
                if (localError) setLocalError('');
              }}
              disabled={actionLoading}
              rows={3}
              placeholder={actionType === 'approve' 
                ? "Ej: Soporte médico verificado. Se autoriza la justificación. (Opcional)" 
                : "Ej: El comprobante adjunto no corresponde a la fecha de la falta..."
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs placeholder-slate-450 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition resize-none"
            />
          </div>

          {/* Action buttons */}
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
              className={`rounded-xl text-white py-2.5 px-6 font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                actionType === 'approve' 
                  ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10' 
                  : 'bg-red-500 hover:bg-red-600 shadow-red-500/10'
              }`}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {actionType === 'approve' ? 'Confirmar Aprobación' : 'Confirmar Rechazo'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default JustificacionActionModal;
