import { useState } from 'react';
import { X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

export default function ResolutionModal({ isOpen, onClose, anomaly, onResolve }) {
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('JUSTIFICADO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !anomaly) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Por favor, ingrese un comentario justificando la resolución.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onResolve(anomaly.id, comment, status);
      setComment('');
      onClose();
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al registrar la resolución en el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const getTipoAnomaliaLabel = (type) => {
    switch (type) {
      case 'MOCK_LOCATION_DETECTADA': return 'GPS Falso / Simulado';
      case 'FACE_MISMATCH': return 'Rostro No Coincide';
      case 'FUERA_DE_GEOCERCA': return 'Fuera de Perímetro';
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs text-left">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-4xs font-mono font-black text-rose-450 uppercase tracking-widest">Auditoría RRHH</span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide mt-0.5">
                Resolver Anomalía Grave
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-semibold text-xs text-slate-350">
          {error && (
            <div className="rounded-xl bg-rose-950/45 p-3 text-5xs font-black uppercase text-rose-400 border border-rose-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Anomaly Specs */}
          <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-450 uppercase text-4xs">Colaborador:</span>
              <span className="text-white font-extrabold">{anomaly.empleadoNombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-450 uppercase text-4xs">Tipo Anomalía:</span>
              <span className="text-rose-400 font-extrabold">{getTipoAnomaliaLabel(anomaly.tipoAnomalia)}</span>
            </div>
            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-medium leading-relaxed">
              {anomaly.detallesTecnicos}
            </div>
          </div>

          {/* Resolution Status */}
          <div className="space-y-1.5">
            <label className="block text-4xs uppercase tracking-wider text-slate-450">Estado de la resolución</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs font-bold text-white focus:border-[#1ba0f2] focus:outline-none cursor-pointer"
            >
              <option value="JUSTIFICADO">JUSTIFICADO (Aprobado por el Admin)</option>
              <option value="RESOLVIDO">RESUELTO (Incidente Corregido/Cerrado)</option>
            </select>
          </div>

          {/* Comment */}
          <div className="space-y-1.5">
            <label className="block text-4xs uppercase tracking-wider text-slate-450">Comentario / Justificación de Auditoría</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej: Colaborador autorizó el ponche fuera de geocerca por visita presencial a cliente..."
              rows="3"
              className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2.5 px-3 text-xs font-medium text-white placeholder-slate-600 focus:border-[#1ba0f2] focus:outline-none"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-3 border-t border-slate-900 uppercase tracking-widest text-4xs font-bold">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-800 hover:bg-slate-900 text-slate-400 transition text-center cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              Registrar Resolución
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
