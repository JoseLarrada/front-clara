import EmpleadoLayout from '../components/EmpleadoLayout';
import CalendarioHistorial from '../components/CalendarioHistorial';
import { FileText } from 'lucide-react';

export default function EmpleadoHistorialPage() {
  return (
    <EmpleadoLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-l-4 border-[#1ba0f2] pl-4 text-left">
          <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <FileText className="h-3 w-3" /> Reportes
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
            Mi Historial
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Visualice sus registros históricos mensuales de entradas, salidas, retardos y ausencias consolidadas.
          </p>
        </div>

        {/* Historial */}
        <div className="text-left">
          <CalendarioHistorial />
        </div>
      </div>
    </EmpleadoLayout>
  );
}
