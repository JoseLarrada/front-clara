import { useState, useEffect } from 'react';
import EmpleadoLayout from '../components/EmpleadoLayout';
import { empleadoService } from '../services/empleadoService';
import { Briefcase, Calendar, DollarSign, Loader2, Sparkles, TrendingUp, HelpCircle, AlertCircle } from 'lucide-react';

export default function EmpleadoContratoPage() {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Proyecciones de Prestaciones estimadas
  const [proyecciones, setProyecciones] = useState({
    diasTrabajadosTotal: 0,
    diasSemestre: 0,
    primaEstimada: 0,
    cesantiasEstimadas: 0,
    interesesCesantias: 0,
    vacacionesAcumuladas: 0
  });

  useEffect(() => {
    const fetchContratoData = async () => {
      try {
        const data = await empleadoService.getMiContrato();
        setContrato(data);
        if (data) {
          calcularPrestaciones(data);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del contrato.');
      } finally {
        setLoading(false);
      }
    };

    fetchContratoData();
  }, []);

  const calcularPrestaciones = (c) => {
    const fechaIngreso = new Date(c.fechaIngreso);
    const hoy = new Date();
    
    // Total de días transcurridos
    const diffTime = Math.abs(hoy - fechaIngreso);
    const diasTrabajadosTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Días trabajados en el semestre en curso (para Prima de servicios)
    // Suponemos semestre actual: 1 de Enero al 30 de Junio
    const inicioSemestre = new Date(hoy.getFullYear(), hoy.getMonth() < 6 ? 0 : 6, 1);
    const fechaInicioCalculoSemestre = fechaIngreso > inicioSemestre ? fechaIngreso : inicioSemestre;
    const diffSemestre = Math.abs(hoy - fechaInicioCalculoSemestre);
    const diasSemestre = Math.ceil(diffSemestre / (1000 * 60 * 60 * 24));

    // Días trabajados en el año actual (para Cesantías e Intereses)
    const inicioAnio = new Date(hoy.getFullYear(), 0, 1);
    const fechaInicioCalculoAnio = fechaIngreso > inicioAnio ? fechaIngreso : inicioAnio;
    const diffAnio = Math.abs(hoy - fechaInicioCalculoAnio);
    const diasAnio = Math.ceil(diffAnio / (1000 * 60 * 60 * 24));

    const salario = c.salarioBaseMensual;

    // Fórmulas legales de prestaciones en Colombia
    // Prima de servicios = (Salario * Días en el semestre) / 360
    const primaEstimada = (salario * diasSemestre) / 360;

    // Cesantías = (Salario * Días en el año) / 360
    const cesantiasEstimadas = (salario * diasAnio) / 360;

    // Intereses a las cesantías = (Cesantías * Días en el año * 0.12) / 360
    const interesesCesantias = (cesantiasEstimadas * diasAnio * 0.12) / 360;

    // Vacaciones causadas = (Salario * Días totales) / 720 (o 15 días por cada 360 días)
    const vacacionesAcumuladas = (diasTrabajadosTotal * 15) / 360;

    setProyecciones({
      diasTrabajadosTotal,
      diasSemestre,
      diasAnio,
      primaEstimada: Math.round(primaEstimada),
      cesantiasEstimadas: Math.round(cesantiasEstimadas),
      interesesCesantias: Math.round(interesesCesantias),
      vacacionesAcumuladas: parseFloat(vacacionesAcumuladas.toFixed(1))
    });
  };

  const formatCurrency = (val, cur) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: cur || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getTipoContratoLabel = (type) => {
    switch (type) {
      case 'TERMINO_INDEFINIDO': return 'Término Indefinido';
      case 'TERMINO_FIJO': return 'Término Fijo';
      case 'PRESTACION_SERVICIOS': return 'Prestación de Servicios';
      case 'APRENDIZAJE': return 'Contrato de Aprendizaje';
      default: return type;
    }
  };

  return (
    <EmpleadoLayout>
      <div className="space-y-8 text-left">
        
        {/* Header */}
        <div className="border-l-4 border-purple-500 pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-purple-700">
            <Briefcase className="h-3 w-3" /> Relación Contractual
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
            Mi Contrato Laboral
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte los términos de su vinculación, salario actual y una estimación de sus prestaciones acumuladas.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-2.5 items-start text-red-800 text-xs font-semibold">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        ) : contrato ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Contract Card Details */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/3 rounded-full blur-3xl -z-10" />
                
                {/* Contract Status Banner */}
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-slate-450 text-[10px] font-extrabold uppercase tracking-widest block">Tipo de Contrato</span>
                    <h3 className="text-[#0f2942] text-md font-extrabold mt-1">
                      {getTipoContratoLabel(contrato.tipoContrato)}
                    </h3>
                  </div>
                  <span className="rounded-full border border-emerald-250 bg-emerald-50 px-3 py-1 text-5xs font-black uppercase tracking-wider text-emerald-700">
                    Contrato Vigente
                  </span>
                </div>

                {/* Salary Display */}
                <div className="my-8 text-center sm:text-left border-y border-slate-100 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 text-4xs font-bold uppercase tracking-widest block">Salario Nominal Mensual</span>
                    <span className="text-3xl font-extrabold text-[#0f2942] font-mono tracking-tight block mt-1.5">
                      {formatCurrency(contrato.salarioBaseMensual, contrato.tipoMoneda)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-4xs font-bold uppercase tracking-widest block">Fecha de Vinculación</span>
                    <span className="text-md font-bold text-slate-650 flex items-center gap-1.5 mt-2.5">
                      <Calendar className="h-4.5 w-4.5 text-purple-500" /> {contrato.fechaIngreso}
                    </span>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="space-y-2 font-semibold">
                  <div className="flex justify-between text-4xs font-bold text-slate-450 uppercase tracking-widest">
                    <span>Tiempo en la Empresa</span>
                    <span className="font-mono text-purple-700">{proyecciones.diasTrabajadosTotal} Días laborados</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full animate-pulse" style={{ width: `${Math.min(100, proyecciones.diasTrabajadosTotal / 3.65)}%` }} />
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed pt-1">
                    Su antigüedad es un factor determinante para el cálculo de su periodo vacacional y liquidación de prestaciones anuales de ley.
                  </p>
                </div>

              </div>

              {/* Proyecciones de Prestaciones Card */}
              <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-250 flex items-center justify-center text-emerald-600">
                    <TrendingUp className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-[#0f2942] text-sm font-extrabold uppercase tracking-wide">
                      Proyección de Prestaciones Acumuladas
                    </h3>
                    <p className="text-4xs text-slate-400 uppercase font-bold tracking-wider mt-0.5">Valores acumulados estimados al día de hoy</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Prima */}
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-4">
                    <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest">Prima de Servicios</span>
                    <span className="block text-lg font-mono font-black text-[#0f2942] mt-1">
                      {formatCurrency(proyecciones.primaEstimada, contrato.tipoMoneda)}
                    </span>
                    <span className="block text-5xs text-slate-450 mt-1 font-semibold uppercase">Acumulado ({proyecciones.diasSemestre} días)</span>
                  </div>

                  {/* Cesantías */}
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-4">
                    <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest">Cesantías</span>
                    <span className="block text-lg font-mono font-black text-[#0f2942] mt-1">
                      {formatCurrency(proyecciones.cesantiasEstimadas, contrato.tipoMoneda)}
                    </span>
                    <span className="block text-5xs text-slate-450 mt-1 font-semibold uppercase">Acumulado ({proyecciones.diasAnio} días)</span>
                  </div>

                  {/* Intereses */}
                  <div className="rounded-2xl border border-slate-150 bg-slate-50/30 p-4">
                    <span className="block text-4xs font-bold text-slate-400 uppercase tracking-widest">Int. sobre Cesantías</span>
                    <span className="block text-lg font-mono font-black text-[#0f2942] mt-1">
                      {formatCurrency(proyecciones.interesesCesantias, contrato.tipoMoneda)}
                    </span>
                    <span className="block text-5xs text-slate-450 mt-1 font-semibold uppercase">Tasa del 12% anual</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150 bg-[#0f2942]/5 p-4 flex gap-3 text-slate-650 leading-relaxed font-semibold">
                  <HelpCircle className="h-5 w-5 text-[#1ba0f2] shrink-0 mt-0.5" />
                  <p className="text-4xs uppercase tracking-wide">
                    <strong>Nota legal aclaratoria:</strong> Estos montos son de carácter puramente informativo e ilustrativo. Representan una proyección proporcional calculada de forma matemática a la fecha de hoy, y están sujetos a los ajustes por inasistencias o deducciones que determine la legislación laboral vigente al momento del cierre de nómina formal.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Column: Vacancy & Stats */}
            <div className="space-y-6">
              
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-650">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-4xl font-mono font-black text-[#0f2942]">
                    {proyecciones.vacacionesAcumuladas}
                  </span>
                  <span className="block text-3xs font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">
                    Días Causados de Vacaciones
                  </span>
                  <p className="text-[10px] text-slate-450 font-medium leading-relaxed mt-2 mx-2">
                    Usted acumula una tasa aproximada de <strong>1.25 días</strong> hábiles de descanso por cada mes completo trabajado desde su fecha de ingreso.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-black text-[#0f2942] uppercase tracking-wider border-b border-slate-100 pb-2">
                  Especificaciones SaaS
                </h4>
                <div className="space-y-3 font-semibold text-3xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Identificador de Contrato</span>
                    <span className="font-mono text-[#0f2942] truncate max-w-[120px]" title={contrato.id}>{contrato.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tipo Moneda</span>
                    <span className="font-bold text-[#0f2942]">{contrato.tipoMoneda}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estado Operativo</span>
                    <span className="font-bold text-emerald-600">VIGENTE</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <span className="text-xs uppercase font-bold">No se encontró ningún contrato laboral asociado a su perfil de empleado.</span>
          </div>
        )}

      </div>
    </EmpleadoLayout>
  );
}
