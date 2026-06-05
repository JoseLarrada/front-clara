import { useState, useEffect } from 'react';
import EmpleadoLayout from '../components/EmpleadoLayout';
import { empleadoService } from '../services/empleadoService';
import { 
  Receipt, 
  Download, 
  Printer, 
  Eye, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  TrendingUp, 
  DollarSign, 
  Info 
} from 'lucide-react';

export default function EmpleadoNominasPage() {
  const [nominas, setNominas] = useState([]);
  const [selectedNomina, setSelectedNomina] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchNominas = async () => {
      try {
        const data = await empleadoService.getMisPrenominas();
        setNominas(data);
        if (data && data.length > 0) {
          // Pre-seleccionar la más reciente
          setSelectedNomina(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar el historial de recibos de nómina.');
      } finally {
        setLoading(false);
      }
    };
    fetchNominas();
  }, []);

  const getNombreMes = (numMes) => {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[numMes - 1] || 'Mes Desconocido';
  };

  const formatCurrency = (val, cur = 'COP') => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleExportCSV = (n) => {
    if (!n) return;
    setExporting(true);
    
    setTimeout(() => {
      const rows = [
        ["REPORTE DE PAGO DE NOMINA - CLARA SAAS", ""],
        ["Periodo", `${getNombreMes(n.mesPeriodo)} ${n.anioPeriodo}`],
        ["Estado Pago", n.estadoReporte],
        ["Fecha Generacion", new Date(n.generadoEl).toLocaleDateString()],
        [],
        ["Detalle de Horas y Dias", ""],
        ["Dias Trabajados Efectivos", n.diasTrabajadosEfectivos],
        ["Dias Falta Injustificada", n.diasFaltaInjustificada],
        ["Horas Extras Diurnas", n.horasExtrasDiurnasTotales],
        ["Horas Extras Nocturnas", n.horasExtrasNocturnasTotales],
        [],
        ["Conceptos Devengados (Ingresos)", ""],
        ["Salario Base Proporcional", n.montoSalarioBaseProporcional],
        ["Recargo Horas Extras", n.montoGananciaExtras],
        ["Total Devengado", n.montoSalarioBaseProporcional + n.montoGananciaExtras],
        [],
        ["Conceptos Deducciones (Egresos)", ""],
        ["Deduccion por Faltas", n.montoDeduccionesFaltas],
        ["Salud (4% Est.)", Math.round(n.montoSalarioBaseProporcional * 0.04)],
        ["Pension (4% Est.)", Math.round(n.montoSalarioBaseProporcional * 0.04)],
        ["Total Deducciones", Math.round(n.montoDeduccionesFaltas + (n.montoSalarioBaseProporcional * 0.08))],
        [],
        ["Total Neto Pagado", n.montoNetoPagar]
      ];

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + rows.map(e => e.map(val => `"${val}"`).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `recibo_nomina_${getNombreMes(n.mesPeriodo).toLowerCase()}_${n.anioPeriodo}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <EmpleadoLayout>
      <div className="space-y-8 text-left print:p-0">
        
        {/* Header */}
        <div className="border-l-4 border-[#1ba0f2] pl-4 print:hidden">
          <span className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#1ba0f2]">
            <Receipt className="h-3 w-3" /> Finanzas & Pagos
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
            Mis Recibos de Nómina
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte el historial de sus pre-nóminas liquidadas, descargue los desprendibles detallados de ingresos y deducciones.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[#1ba0f2]" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-2.5 items-start text-red-800 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        ) : nominas.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <span className="text-xs uppercase font-bold">No se han registrado cierres de nómina en su historial.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Pay Slip History List (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-4 print:hidden">
              <h3 className="text-xs font-extrabold text-[#0f2942] uppercase tracking-wider mb-2">
                Historial de Recibos
              </h3>
              
              <div className="space-y-3">
                {nominas.map((n) => {
                  const isSelected = selectedNomina?.id === n.id;
                  return (
                    <div 
                      key={n.id}
                      onClick={() => setSelectedNomina(n)}
                      className={`p-4 rounded-2xl border transition duration-200 cursor-pointer text-left ${
                        isSelected 
                          ? 'border-[#1ba0f2] bg-sky-50/20 shadow-xs' 
                          : 'border-slate-150 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Periodo de Pago</span>
                          <h4 className="text-sm font-extrabold text-[#0f2942] mt-0.5">
                            {getNombreMes(n.mesPeriodo)} - {n.anioPeriodo}
                          </h4>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                          n.estadoReporte === 'PROCESADO_PAGO'
                            ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border border-amber-250 bg-amber-50 text-amber-700'
                        }`}>
                          {n.estadoReporte === 'PROCESADO_PAGO' ? 'Pagado' : n.estadoReporte}
                        </span>
                      </div>

                      <div className="mt-4 flex justify-between items-end border-t border-slate-100/80 pt-3">
                        <div>
                          <span className="text-[9px] text-slate-450 uppercase font-bold tracking-wider">Neto Recibido</span>
                          <span className="block text-md font-mono font-black text-[#0f2942] mt-0.5">
                            {formatCurrency(n.montoNetoPagar)}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#1ba0f2] font-black uppercase tracking-wider">
                          <Eye className="h-3.5 w-3.5" /> Ver Detalle
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Pay Slip Detail / Voucher (lg:col-span-7) */}
            <div className="lg:col-span-7">
              {selectedNomina ? (
                <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden print:border-none print:shadow-none print:p-0">
                  
                  {/* Actions Header (Print/Download) - Hidden in Print */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4 print:hidden">
                    <span className="text-xs font-black text-[#0f2942] uppercase tracking-wider flex items-center gap-1.5">
                      <Receipt className="h-4.5 w-4.5 text-[#1ba0f2]" /> Detalle del Desprendible
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handlePrint}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition duration-150 text-slate-600 hover:text-slate-800 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        title="Imprimir Recibo"
                      >
                        <Printer className="h-3.5 w-3.5" />
                        <span>Imprimir</span>
                      </button>
                      <button
                        onClick={() => handleExportCSV(selectedNomina)}
                        disabled={exporting}
                        className="p-2 rounded-xl bg-[#0f2942] hover:bg-[#153a5c] transition duration-150 text-white flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                        title="Exportar CSV"
                      >
                        {exporting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                        <span>{exporting ? 'Generando...' : 'Descargar'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Printable Voucher Shell */}
                  <div className="space-y-6 print:space-y-4">
                    {/* Voucher Brand & Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-150 pb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-5 w-5 text-[#0f2942]" />
                          <span className="text-base font-extrabold text-[#0f2942] tracking-tighter">CLARA SAAS</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Nit: 901.482.119-3 | Bogotá, D.C.</p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">Comprobante de Pago</span>
                        <h2 className="text-lg font-extrabold text-[#0f2942]">
                          Periodo: {getNombreMes(selectedNomina.mesPeriodo)} {selectedNomina.anioPeriodo}
                        </h2>
                      </div>
                    </div>

                    {/* Employee Profile info in Voucher */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/50 rounded-2xl p-4 border border-slate-100 print:bg-white print:border-slate-150">
                      <div className="space-y-2 text-3xs font-semibold">
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Colaborador:</span>
                          <span className="text-[#0f2942] font-bold">Carles Perez</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Identificación:</span>
                          <span className="text-[#0f2942] font-mono">1.094.225.441</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Estado Pago:</span>
                          <span className="text-emerald-700 font-extrabold uppercase">PAGADO (PROCESADO)</span>
                        </div>
                      </div>
                      <div className="space-y-2 text-3xs font-semibold">
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Días Liquidados:</span>
                          <span className="text-[#0f2942]">{selectedNomina.diasTrabajadosEfectivos} Días</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Inasistencias:</span>
                          <span className={`${selectedNomina.diasFaltaInjustificada > 0 ? 'text-red-650 font-bold' : 'text-slate-450'}`}>
                            {selectedNomina.diasFaltaInjustificada} Días
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-slate-400 w-24">Fecha Recibo:</span>
                          <span className="text-slate-650 font-mono">{new Date(selectedNomina.generadoEl).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Ledger: Earnings and Deductions */}
                    <div className="border border-slate-150 rounded-2xl overflow-hidden">
                      <table className="w-full text-xs text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-black uppercase text-slate-500 tracking-wider">
                            <th className="py-2.5 px-4">Concepto Salarial</th>
                            <th className="py-2.5 px-4 text-center">Fórmula / Cant.</th>
                            <th className="py-2.5 px-4 text-right">Devengados</th>
                            <th className="py-2.5 px-4 text-right">Deducciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                          {/* Salario Base Proporcional */}
                          <tr>
                            <td className="py-3 px-4 text-[#0f2942]">
                              Salario Base Proporcional
                              <span className="block text-[9px] text-slate-400 font-medium">Salario asignado por días efectivamente laborados</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-mono">
                              {selectedNomina.diasTrabajadosEfectivos}/30 Días
                            </td>
                            <td className="py-3 px-4 text-right text-slate-900 font-mono">
                              {formatCurrency(selectedNomina.montoSalarioBaseProporcional)}
                            </td>
                            <td className="py-3 px-4 text-right text-slate-400 font-mono">-</td>
                          </tr>

                          {/* Recargo Horas Extras */}
                          {selectedNomina.montoGananciaExtras > 0 && (
                            <tr>
                              <td className="py-3 px-4 text-[#0f2942]">
                                Recargo por Horas Extras
                                <span className="block text-[9px] text-slate-400 font-medium">
                                  Diurnas: {selectedNomina.horasExtrasDiurnasTotales}h | Nocturnas: {selectedNomina.horasExtrasNocturnasTotales}h
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center text-slate-500 font-mono">
                                {(selectedNomina.horasExtrasDiurnasTotales + selectedNomina.horasExtrasNocturnasTotales).toFixed(1)} hrs
                              </td>
                              <td className="py-3 px-4 text-right text-slate-900 font-mono">
                                {formatCurrency(selectedNomina.montoGananciaExtras)}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-400 font-mono">-</td>
                            </tr>
                          )}

                          {/* Deducciones por Faltas */}
                          {selectedNomina.montoDeduccionesFaltas > 0 && (
                            <tr className="bg-red-50/10">
                              <td className="py-3 px-4 text-red-800">
                                Deducción Inasistencias
                                <span className="block text-[9px] text-red-500/80 font-medium">Días no justificados descontados</span>
                              </td>
                              <td className="py-3 px-4 text-center text-red-500 font-mono">
                                {selectedNomina.diasFaltaInjustificada} Días
                              </td>
                              <td className="py-3 px-4 text-right text-slate-400 font-mono">-</td>
                              <td className="py-3 px-4 text-right text-red-650 font-mono">
                                {formatCurrency(selectedNomina.montoDeduccionesFaltas)}
                              </td>
                            </tr>
                          )}

                          {/* Deducción Salud Estándar 4% */}
                          <tr>
                            <td className="py-3 px-4 text-[#0f2942]">
                              Salud Obligatoria
                              <span className="block text-[9px] text-slate-400 font-medium">Aporte empleado (4% sobre salario devengado)</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-mono">4.0%</td>
                            <td className="py-3 px-4 text-right text-slate-400 font-mono">-</td>
                            <td className="py-3 px-4 text-right text-[#0f2942] font-mono">
                              {formatCurrency(Math.round(selectedNomina.montoSalarioBaseProporcional * 0.04))}
                            </td>
                          </tr>

                          {/* Deducción Pensión Estándar 4% */}
                          <tr>
                            <td className="py-3 px-4 text-[#0f2942]">
                              Pensión Obligatoria
                              <span className="block text-[9px] text-slate-400 font-medium">Aporte empleado (4% sobre salario devengado)</span>
                            </td>
                            <td className="py-3 px-4 text-center text-slate-500 font-mono">4.0%</td>
                            <td className="py-3 px-4 text-right text-slate-400 font-mono">-</td>
                            <td className="py-3 px-4 text-right text-[#0f2942] font-mono">
                              {formatCurrency(Math.round(selectedNomina.montoSalarioBaseProporcional * 0.04))}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Totals */}
                    <div className="flex flex-col items-end gap-2 border-t border-slate-150 pt-4 font-semibold text-3xs">
                      <div className="flex justify-between w-64 text-slate-500">
                        <span>Total Devengado (Ingresos):</span>
                        <span className="font-mono text-slate-800">
                          {formatCurrency(selectedNomina.montoSalarioBaseProporcional + selectedNomina.montoGananciaExtras)}
                        </span>
                      </div>
                      <div className="flex justify-between w-64 text-slate-500">
                        <span>Total Deducciones (Egresos):</span>
                        <span className="font-mono text-slate-800">
                          {formatCurrency(
                            Math.round(
                              selectedNomina.montoDeduccionesFaltas + 
                              (selectedNomina.montoSalarioBaseProporcional * 0.08)
                            )
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between w-64 border-t border-slate-150 pt-2 text-xs font-black text-[#0f2942]">
                        <span className="uppercase">Neto Pagado Recibido:</span>
                        <span className="font-mono text-base text-[#1ba0f2]">
                          {formatCurrency(selectedNomina.montoNetoPagar)}
                        </span>
                      </div>
                    </div>

                    {/* Footer legalities */}
                    <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-4 flex gap-3 text-slate-500 leading-relaxed font-semibold">
                      <Info className="h-4.5 w-4.5 text-[#1ba0f2] shrink-0 mt-0.5 print:hidden" />
                      <p className="text-[9px] uppercase tracking-wide">
                        <strong>Certificación de Recepción:</strong> Este recibo digital sirve como soporte de pago formal liquidado y transferido electrónicamente a su cuenta de nómina registrada. La información contenida coincide plenamente con los reportes aprobados por el departamento de Recursos Humanos de Clara SaaS.
                      </p>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                  <span className="text-xs uppercase font-bold">Seleccione un periodo en el panel izquierdo para ver el recibo correspondiente.</span>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </EmpleadoLayout>
  );
}
