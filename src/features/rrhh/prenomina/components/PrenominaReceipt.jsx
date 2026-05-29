import { Calculator, Award, Landmark, TrendingDown, DollarSign, Calendar } from 'lucide-react';

function PrenominaReceipt({
  data
}) {
  if (!data) return null;

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700 max-w-xl mx-auto">
      
      {/* Header Area */}
      <div className="p-5 border-b border-slate-150 bg-[#0f2942] text-white flex justify-between items-center">
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded bg-[#1ba0f2] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
            Pre-nómina Individual
          </span>
          <h3 className="text-sm font-black tracking-wide truncate max-w-[250px]">{data.empleadoNombre}</h3>
          <span className="block text-[10px] text-white/50 font-mono">ID: {data.empleadoId}</span>
        </div>
        <div className="text-right">
          <span className="block text-3xs text-white/50 font-bold uppercase tracking-wider">Periodo</span>
          <div className="inline-flex items-center gap-1 font-mono font-bold text-3xs bg-white/10 rounded-lg px-2.5 py-1 mt-1 text-[#22ccf2]">
            <Calendar className="h-3 w-3 text-white/70" />
            <span>{data.fechaInicio} / {data.fechaFin}</span>
          </div>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-6 space-y-6">
        
        {/* Profile and general Info */}
        <div className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-4 text-center">
          <div>
            <span className="block text-4xs text-slate-400 font-bold uppercase tracking-wider">Contrato</span>
            <span className="block text-2xs font-extrabold text-[#0f2942] mt-1">{data.tipoContrato || 'INDEFINIDO'}</span>
          </div>
          <div>
            <span className="block text-4xs text-slate-400 font-bold uppercase tracking-wider">Moneda</span>
            <span className="block text-2xs font-extrabold text-[#0f2942] mt-1">{data.tipoMoneda || 'COP'}</span>
          </div>
          <div>
            <span className="block text-4xs text-slate-400 font-bold uppercase tracking-wider">Días Laborados</span>
            <span className="block text-2xs font-black text-[#1ba0f2] mt-1">{data.diasTrabajadosEfectivos} días</span>
          </div>
        </div>

        {/* Detailed accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Earnings */}
          <div className="space-y-3.5">
            <h4 className="text-3xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-1.5">
              <Award className="h-3.5 w-3.5 text-emerald-500" /> Ingresos (Devengados)
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <span>Salario Base Proporcional</span>
                <span className="font-mono font-bold">{formatCurrency(data.montoSalarioBaseProporcional)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <div className="leading-tight">
                  <span>Horas Extras Diurnas</span>
                  <span className="block text-4xs text-slate-450 font-mono">Cantidad: {data.horasExtrasDiurnasTotales} horas</span>
                </div>
                <span className="font-mono font-bold text-emerald-650">
                  +{formatCurrency((data.montoGananciaExtras * 0.6))}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <div className="leading-tight">
                  <span>Horas Extras Nocturnas</span>
                  <span className="block text-4xs text-slate-455 font-mono">Cantidad: {data.horasExtrasNocturnasTotales} horas</span>
                </div>
                <span className="font-mono font-bold text-emerald-650">
                  +{formatCurrency((data.montoGananciaExtras * 0.4))}
                </span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="space-y-3.5">
            <h4 className="text-3xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1 border-b border-slate-100 pb-1.5">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" /> Deducciones (Descuentos)
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between font-medium">
                <div className="leading-tight">
                  <span>Faltas Injustificadas</span>
                  <span className="block text-4xs text-slate-450 font-mono">Cantidad: {data.diasFaltaInjustificada} días</span>
                </div>
                <span className="font-mono font-bold text-red-650">
                  -{formatCurrency(data.montoDeduccionesFaltas)}
                </span>
              </div>
              <div className="flex justify-between font-medium">
                <div className="leading-tight">
                  <span>Penalización por Retardos</span>
                  <span className="block text-4xs text-slate-450 font-mono">Llegadas tardías: {data.llegadasTardias}</span>
                </div>
                <span className="font-mono font-bold text-red-650">-$0</span>
              </div>
            </div>
          </div>

        </div>

        {/* Totals panel */}
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-150 space-y-2.5">
          <div className="flex justify-between text-3xs font-bold text-slate-500 uppercase">
            <span>Subtotal Devengados</span>
            <span className="font-mono">{formatCurrency(data.montoSalarioBaseProporcional + data.montoGananciaExtras)}</span>
          </div>
          <div className="flex justify-between text-3xs font-bold text-slate-500 uppercase">
            <span>Subtotal Deducciones</span>
            <span className="font-mono text-red-650">-{formatCurrency(data.montoDeduccionesFaltas)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-slate-200 pt-3 mt-1">
            <span className="text-2xs font-extrabold text-[#0f2942] uppercase tracking-wider flex items-center gap-1">
              <Landmark className="h-4 w-4 text-[#1ba0f2]" /> Total Neto a Pagar
            </span>
            <span className="text-xl font-mono font-black text-[#1ba0f2]">
              {formatCurrency(data.montoNetoPagar)}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default PrenominaReceipt;
