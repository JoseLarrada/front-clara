import { useState, useEffect } from 'react';
import { empleadoService } from '../services/empleadoService';
import { Calendar, RefreshCw, ChevronLeft, ChevronRight, Clock, Award, XCircle, AlertTriangle } from 'lucide-react';

export default function CalendarioHistorial() {
  const [loading, setLoading] = useState(false);
  const [historial, setHistorial] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchHistorial = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await empleadoService.getHistorialMensual(year, month);
      setHistorial(data);
    } catch (err) {
      console.error('Error fetching attendance history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, [currentDate]);

  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const copy = new Date(prev);
      copy.setMonth(copy.getMonth() + offset);
      return copy;
    });
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  };

  // Convertir segundos a horas legibles
  const formatHours = (seconds) => {
    if (!seconds) return '0 hrs';
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} hrs`;
  };

  const getStatusBadge = (estadoEntrada, estadoDia) => {
    if (estadoDia === 'SIN_REGISTRO') return <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Falta</span>;
    if (estadoDia === 'NO_LABORAL') return <span className="bg-slate-50 border border-slate-200 text-slate-550 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center">Descanso</span>;
    if (estadoDia === 'PENDIENTE') return <span className="bg-slate-50 border border-slate-250 text-slate-400 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center">Pendiente</span>;
    
    switch (estadoEntrada) {
      case 'A_TIEMPO': return <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1"><Award className="w-3.5 h-3.5" /> A tiempo</span>;
      case 'RETARDO': return <span className="bg-amber-50 border border-amber-200 text-amber-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Retardo</span>;
      case 'FALTA_JUSTIFICADA': return <span className="bg-blue-50 border border-blue-200 text-blue-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center">F. Justificada</span>;
      case 'FALTA_INJUSTIFICADA': return <span className="bg-rose-50 border border-rose-200 text-rose-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center">Falta</span>;
      default: return <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[11px] px-2.5 py-1 rounded-full inline-flex items-center">Presente</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm relative text-slate-800">
      {/* Cabecera del Calendario */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h3 className="text-[#0f2942] text-lg font-extrabold mb-1 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1ba0f2]" /> Historial de Asistencia
          </h3>
          <p className="text-slate-550 text-xs font-semibold">
            Control de asistencia, llegadas tarde, faltas y horas netas trabajadas.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200 self-end sm:self-auto shadow-xs">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 text-slate-550 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[#0f2942] text-xs font-bold capitalize px-3 select-none">
            {getMonthName(currentDate)}
          </span>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 text-slate-550 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <RefreshCw className="w-8 h-8 text-[#1ba0f2] animate-spin" />
        </div>
      ) : (
        historial && (
          <div className="space-y-6">
            {/* Tarjetas Resumen */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-semibold">
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xs">
                <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block">Asistencias</span>
                <span className="text-[#0f2942] text-2xl font-extrabold mt-1 block">{historial.totalAsistencias}</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xs">
                <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block">Retardos</span>
                <span className="text-amber-600 text-2xl font-extrabold mt-1 block">{historial.totalRetardos}</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xs">
                <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block">Inasistencias</span>
                <span className="text-rose-600 text-2xl font-extrabold mt-1 block">{historial.totalFaltas}</span>
              </div>
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl shadow-xs">
                <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block">Horas Netas</span>
                <span className="text-[#1ba0f2] text-2xl font-extrabold mt-1 block">{formatHours(historial.totalHorasNetasSegundos)}</span>
              </div>
            </div>

            {/* Tabla de registros */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-550 text-[10px] font-extrabold uppercase tracking-widest">
                    <th className="py-3.5 px-4">Fecha</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Modalidad</th>
                    <th className="py-3.5 px-4">Entrada</th>
                    <th className="py-3.5 px-4">Salida</th>
                    <th className="py-3.5 px-4">Horas Netas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-650 text-xs font-semibold">
                  {historial.calendario?.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-all">
                      <td className="py-3.5 px-4 font-bold text-slate-800">
                        {new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(item.estadoEntrada, item.estadoDia)}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-bold text-slate-500">
                        {item.modalidadAplicada || '--'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {item.horaEntrada ? new Date(item.horaEntrada).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                        {item.horaSalida ? new Date(item.horaSalida).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '--'}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-[#0f2942]">
                        {item.horasNetasSegundos ? formatHours(item.horasNetasSegundos) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
}
