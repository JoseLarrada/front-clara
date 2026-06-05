import { useState, useEffect } from 'react';
import { X, Briefcase, Calendar, DollarSign, Loader2, AlertCircle, Info } from 'lucide-react';
import { getMiContrato } from '../services/employeeService';

export default function MyContractModal({ isOpen, onClose }) {
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchContratoData = async () => {
        setLoading(true);
        setError('');
        try {
          const data = await getMiContrato();
          setContrato(data);
        } catch (err) {
          console.error(err);
          setError('No se pudo cargar la información de su contrato.');
        } finally {
          setLoading(false);
        }
      };
      fetchContratoData();
    }
  }, [isOpen]);

  const formatCurrency = (value, cur) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: cur || 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-150 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-200 flex items-center justify-center text-purple-650">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-4xs font-mono font-black text-slate-400 uppercase tracking-widest">Portal Colaborador</span>
              <h3 className="text-md font-extrabold text-[#0f2942] uppercase tracking-wide mt-0.5">
                Mi Contrato Laboral
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 font-semibold text-xs text-slate-700 space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#1ba0f2]" />
              <span className="text-4xs font-black uppercase tracking-wider text-slate-400">Cargando detalles de contrato...</span>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 text-5xs font-black uppercase text-red-750 border border-red-250 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          ) : contrato ? (
            <div className="space-y-6">
              
              {/* Contract Card Details */}
              <div className="bg-slate-50/50 border border-slate-150 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <span className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest block">Modalidad de Vinculación</span>
                    <h4 className="text-[#0f2942] text-sm font-extrabold mt-1">
                      {getTipoContratoLabel(contrato.tipoContrato)}
                    </h4>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-5xs font-black uppercase tracking-wider border ${
                    contrato.activo
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                      : 'bg-slate-50 text-slate-450 border-slate-200'
                  }`}>
                    {contrato.activo ? 'Vigente / Activo' : 'Terminado / Inactivo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-slate-150/80 pt-5">
                  <div>
                    <span className="text-slate-400 text-4xs font-bold uppercase tracking-widest block">Salario Base Mensual</span>
                    <span className="text-2xl font-extrabold text-[#0f2942] font-mono tracking-tight block mt-1">
                      {formatCurrency(contrato.salarioBaseMensual, contrato.tipoMoneda)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4.5 w-4.5 text-[#1ba0f2]" />
                      <div>
                        <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Fecha Ingreso</span>
                        <span className="text-3xs font-mono font-bold text-[#0f2942]">{contrato.fechaIngreso}</span>
                      </div>
                    </div>
                    {contrato.fechaRetiro && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4.5 w-4.5 text-rose-500" />
                        <div>
                          <span className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block">Fecha Retiro / Vencimiento</span>
                          <span className="text-3xs font-mono font-bold text-rose-700">{contrato.fechaRetiro}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Extra Details */}
              <div className="rounded-xl border border-slate-150 bg-slate-50/20 p-4 space-y-3.5">
                <h4 className="text-3xs font-black text-[#0f2942] uppercase tracking-wider border-b border-slate-150 pb-2">
                  Información Técnica del Registro
                </h4>
                <div className="grid grid-cols-2 gap-4 text-3xs font-semibold text-slate-500">
                  <div>
                    <span className="block text-slate-400 uppercase tracking-wide">ID Contrato</span>
                    <span className="block font-mono text-[#0f2942] mt-0.5 truncate" title={contrato.id}>{contrato.id}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase tracking-wide">Colaborador</span>
                    <span className="block font-bold text-[#0f2942] mt-0.5">{contrato.empleadoNombre}</span>
                  </div>
                </div>
              </div>

              {/* Note */}
              <div className="rounded-xl border border-slate-150 bg-[#0f2942]/5 p-4 flex gap-3 text-slate-650 leading-relaxed font-semibold">
                <Info className="h-4.5 w-4.5 text-[#1ba0f2] shrink-0 mt-0.5" />
                <p className="text-[10px] uppercase tracking-wide">
                  <strong>Nota aclaratoria:</strong> Esta información contractual representa el registro formal almacenado en el sistema SaaS de Clara. Si observa alguna inconsistencia, por favor comuníquese de inmediato con el departamento de Recursos Humanos.
                </p>
              </div>

            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <span className="text-xs uppercase font-bold">No se encontró información contractual activa asociada a su perfil.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex justify-end font-bold text-4xs uppercase tracking-wider">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-550 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
