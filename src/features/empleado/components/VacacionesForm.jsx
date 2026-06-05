import { useState, useEffect } from 'react';
import { empleadoService } from '../services/empleadoService';
import { Calendar, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

export default function VacacionesForm() {
  const [saldo, setSaldo] = useState(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSaldo = async () => {
    setLoadingSaldo(true);
    try {
      const data = await empleadoService.getSaldoVacaciones();
      setSaldo(data.saldoVacaciones);
    } catch (err) {
      console.error('Error fetching vacations balance', err);
    } finally {
      setLoadingSaldo(false);
    }
  };

  useEffect(() => {
    fetchSaldo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fechaInicio || !fechaFin) {
      setError('Por favor, seleccione las fechas de inicio y fin.');
      return;
    }

    setLoadingSubmit(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await empleadoService.solicitarVacaciones({ fechaInicio, fechaFin });
      setSuccess(`Solicitud creada con éxito. Total días: ${res.diasSolicitados}. Estado: ${res.estadoSolicitud}`);
      setFechaInicio('');
      setFechaFin('');
      fetchSaldo();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud de vacaciones.');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm relative text-slate-800">
      <h3 className="text-[#0f2942] text-lg font-extrabold mb-1 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-[#1ba0f2]" /> Solicitar Vacaciones
      </h3>
      <p className="text-slate-500 text-xs font-semibold mb-6">
        Selecciona las fechas para tu descanso. Tu solicitud será evaluada por RRHH.
      </p>

      {/* Saldo de vacaciones */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 mb-6 flex justify-between items-center shadow-xs">
        <div>
          <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block">
            Saldo de días disponibles
          </span>
          <span className="text-[#0f2942] text-3xl font-extrabold font-mono mt-1 block">
            {loadingSaldo ? (
              <RefreshCw className="w-6 h-6 animate-spin text-slate-400 mt-1" />
            ) : (
              saldo !== null ? `${saldo} días` : '--'
            )}
          </span>
        </div>
        <button
          onClick={fetchSaldo}
          className="p-2 text-slate-550 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-750 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-emerald-800 text-sm font-semibold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-semibold">
          <div>
            <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] transition-all text-xs [color-scheme:light]"
            />
          </div>
          <div>
            <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
              Fecha de Finalización
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] transition-all text-xs [color-scheme:light]"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loadingSubmit}
          className="w-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-[#1ba0f2]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
        >
          {loadingSubmit && <RefreshCw className="w-4 h-4 animate-spin" />}
          Enviar Solicitud
        </button>
      </form>
    </div>
  );
}
