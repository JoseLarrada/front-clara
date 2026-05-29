import { FileText, Calculator } from 'lucide-react';

function PrenominaTable({
  results,
  loading
}) {
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
    <div className="rounded-3xl border border-slate-150 bg-white shadow-sm overflow-hidden text-left font-semibold text-xs text-slate-700">
      
      {/* Table Header */}
      <div className="p-5 border-b border-slate-150 bg-slate-50/50">
        <h3 className="text-sm font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5">
          <Calculator className="h-4.5 w-4.5 text-[#1ba0f2]" /> Pre-nómina Consolidada
        </h3>
        <p className="text-4xs text-slate-450 mt-1.5 uppercase font-bold tracking-wider">Desglose de ingresos ordinarios, extraordinarios y deducciones</p>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto relative min-h-[150px]">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
            <tr>
              <th className="px-6 py-3.5">Colaborador</th>
              <th className="px-6 py-3.5 text-center">Días Trab.</th>
              <th className="px-6 py-3.5 text-center">Faltas</th>
              <th className="px-6 py-3.5 text-center">Horas Extras</th>
              <th className="px-6 py-3.5 text-right">Salario Base</th>
              <th className="px-6 py-3.5 text-right">Ganancia Extras</th>
              <th className="px-6 py-3.5 text-right">Deducciones</th>
              <th className="px-6 py-3.5 text-right font-extrabold text-[#0f2942]">Neto a Pagar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150 bg-white">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1ba0f2] border-t-transparent" />
                    <span className="text-slate-400 font-bold uppercase tracking-widest text-4xs">Calculando pre-nómina...</span>
                  </div>
                </td>
              </tr>
            ) : results.length > 0 ? (
              results.map((res) => (
                <tr key={res.empleadoId} className="hover:bg-[#0f2942]/5 transition">
                  
                  {/* Colaborador */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-full bg-[#0f2942]/5 text-[#0f2942] font-black text-3xs uppercase flex items-center justify-center">
                        {res.empleadoNombre.substring(0, 2)}
                      </div>
                      <div>
                        <span className="block font-extrabold text-[#0f2942]">{res.empleadoNombre}</span>
                        <span className="block text-4xs text-slate-400 font-mono tracking-normal leading-none mt-0.5">{res.empleadoId.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  
                  {/* Dias Trabajados */}
                  <td className="px-6 py-4 text-center font-mono text-slate-650">
                    {res.diasTrabajadosEfectivos}
                  </td>
                  
                  {/* Faltas */}
                  <td className="px-6 py-4 text-center font-mono font-bold text-red-650">
                    {res.diasFaltaInjustificada}
                  </td>

                  {/* Horas Extras */}
                  <td className="px-6 py-4 text-center font-mono font-medium text-slate-600 text-3xs">
                    <span className="block">D: {res.horasExtrasDiurnasTotales}h</span>
                    <span className="block text-slate-400">N: {res.horasExtrasNocturnasTotales}h</span>
                  </td>

                  {/* Salario Base */}
                  <td className="px-6 py-4 text-right font-mono text-slate-600">
                    {formatCurrency(res.montoSalarioBaseProporcional)}
                  </td>

                  {/* Ganancia Extras */}
                  <td className="px-6 py-4 text-right font-mono text-emerald-650">
                    +{formatCurrency(res.montoGananciaExtras)}
                  </td>

                  {/* Deducciones */}
                  <td className="px-6 py-4 text-right font-mono text-red-650">
                    -{formatCurrency(res.montoDeduccionesFaltas)}
                  </td>

                  {/* Neto a pagar */}
                  <td className="px-6 py-4 text-right font-mono font-black text-[#1ba0f2] text-sm">
                    {formatCurrency(res.montoNetoPagar)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-slate-400">
                    <span className="font-extrabold uppercase tracking-wider">Sin resultados</span>
                    <span className="text-3xs text-slate-450">Defina el periodo y ejecute el cálculo para visualizar los consolidados.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default PrenominaTable;
