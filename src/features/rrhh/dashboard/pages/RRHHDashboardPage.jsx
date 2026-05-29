import { useRRHHDashboard } from '../hooks/useRRHHDashboard';
import RRHHLayout from '../../common/components/RRHHLayout';
import RealTimeStats from '../components/RealTimeStats';
import { Calendar as CalendarIcon, ArrowRight, ShieldCheck, Users, Clock, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

function RRHHDashboardPage() {
  const { stats, fecha, loading, error, handleFechaChange } = useRRHHDashboard();

  return (
    <RRHHLayout>
      <div className="space-y-8">
        
        {/* Welcome & Date Filter Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-l-4 border-[#1ba0f2] pl-4 text-left">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
              <ShieldCheck className="h-3 w-3" /> Resumen de Asistencia
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
              Monitoreo en Tiempo Real
            </h1>
            <p className="mt-2.5 text-xs text-slate-500 font-semibold leading-relaxed">
              Consulte las asistencias, retardos, ausencias y teletrabajo del personal de su tenant.
            </p>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm font-semibold text-xs text-slate-700">
            <CalendarIcon className="h-4 w-4 text-[#1ba0f2]" />
            <span className="text-slate-400 font-bold uppercase tracking-wider text-5xs mr-1">Fecha Asistencia</span>
            <input
              type="date"
              value={fecha}
              onChange={(e) => handleFechaChange(e.target.value)}
              className="border-none focus:outline-none focus:ring-0 text-slate-800 font-bold bg-transparent text-xs"
            />
          </div>
        </div>

        {/* Real-time stats grid */}
        {error ? (
          <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-red-650 text-left">
            {error}
          </div>
        ) : (
          <RealTimeStats stats={stats} loading={loading} />
        )}

        {/* Quick Actions Panel */}
        <div className="grid gap-6 md:grid-cols-2 text-left font-semibold text-xs text-slate-700">
          
          {/* Card 1: Employee Management */}
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide">Directorio de Personal</h3>
              <p className="text-3xs text-slate-500 mt-2 leading-relaxed">
                Gestione altas, bajas y modificaciones de la plantilla laboral. Configure las modalidades híbrida, presencial o remota e ingrese los saldos de vacaciones correspondientes.
              </p>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
              <Link 
                to="/rrhh/empleados" 
                className="inline-flex items-center gap-1.5 text-3xs font-black text-[#1ba0f2] hover:text-[#1ba0f2]/80 uppercase tracking-widest cursor-pointer"
              >
                Ir a colaboradores <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Configuration & Settings */}
          <div className="rounded-3xl border border-slate-150 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f2942]/5 text-[#0f2942] border border-[#0f2942]/10 mb-4">
                <Settings className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide">Horarios y Parámetros</h3>
              <p className="text-3xs text-slate-500 mt-2 leading-relaxed">
                Configure las horas de entrada oficial, tolerancia de retardos y límites para faltas automáticas. Parametrice los factores de hora extra diurna, nocturna o festiva del tenant.
              </p>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => alert('La sección de Configuración de Jornadas y Recargos se habilitará en la FASE 2.')}
                className="inline-flex items-center gap-1.5 text-3xs font-black text-slate-400 hover:text-slate-500 uppercase tracking-widest cursor-pointer"
              >
                Configurar políticas <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </RRHHLayout>
  );
}

export default RRHHDashboardPage;
