import EmpleadoLayout from '../components/EmpleadoLayout';
import VacacionesForm from '../components/VacacionesForm';
import { Calendar } from 'lucide-react';

export default function EmpleadoVacacionesPage() {
  return (
    <EmpleadoLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-l-4 border-[#1ba0f2] pl-4 text-left">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Calendar className="h-3 w-3" /> Solicitudes
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
            Mis Vacaciones
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte sus días disponibles y envíe nuevas solicitudes de descanso anual al área de RRHH.
          </p>
        </div>

        {/* Formulario */}
        <div className="max-w-2xl text-left">
          <VacacionesForm />
        </div>
      </div>
    </EmpleadoLayout>
  );
}
