import { useState, useEffect, useCallback } from 'react';
import { 
  X, Briefcase, Calendar, DollarSign, Plus, Check, Loader2, 
  AlertCircle, History, Clock, FilePlus2, UserMinus, ShieldAlert, Sparkles 
} from 'lucide-react';
import { 
  getContratosByEmpleado, crearContrato, cerrarContrato, extenderContrato, eliminarContrato 
} from '../services/contratosService';

export default function EmployeeContractsModal({ isOpen, onClose, employee }) {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab control: 'list' (view history) or 'new' (add contract)
  const [activeTab, setActiveTab] = useState('list');

  // Sub-forms states
  const [closeTarget, setCloseTarget] = useState(null); // contract to close
  const [extendTarget, setExtendTarget] = useState(null); // contract to extend

  // Fields for new contract
  const [salario, setSalario] = useState('');
  const [moneda, setMoneda] = useState('COP');
  const [tipoContrato, setTipoContrato] = useState('TERMINO_INDEFINIDO');
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [fechaRetiro, setFechaRetiro] = useState('');
  const [activo, setActivo] = useState(true);

  // Fields for extension
  const [nuevaFechaRetiro, setNuevaFechaRetiro] = useState('');
  const [nuevoSalario, setNuevoSalario] = useState('');

  // Fields for closing
  const [fechaRetiroEfectiva, setFechaRetiroEfectiva] = useState('');

  const fetchContratos = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    setError('');
    try {
      const data = await getContratosByEmpleado(employee.id);
      setContratos(data || []);
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el historial de contratos.');
    } finally {
      setLoading(false);
    }
  }, [employee]);

  useEffect(() => {
    if (isOpen && employee) {
      fetchContratos();
      setActiveTab('list');
      resetNewForm();
      resetSubForms();
    }
  }, [isOpen, employee, fetchContratos]);

  const resetNewForm = () => {
    setSalario('');
    setMoneda('COP');
    setTipoContrato('TERMINO_INDEFINIDO');
    
    // Default start date to today
    const todayStr = new Date().toISOString().substring(0, 10);
    setFechaIngreso(todayStr);
    setFechaRetiro('');
    setActivo(true);
  };

  const resetSubForms = () => {
    setCloseTarget(null);
    setExtendTarget(null);
    setFechaRetiroEfectiva('');
    setNuevaFechaRetiro('');
    setNuevoSalario('');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!salario || Number(salario) <= 0) {
      setError('El salario base mensual debe ser mayor a cero.');
      return;
    }
    if (!fechaIngreso) {
      setError('La fecha de ingreso es obligatoria.');
      return;
    }
    if ((tipoContrato === 'TERMINO_FIJO' || tipoContrato === 'APRENDIZAJE') && !fechaRetiro) {
      setError('Para contratos de término fijo o aprendizaje se requiere fecha de retiro.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await crearContrato({
        empleadoId: employee.id,
        empleadoNombre: employee.nombreCompleto,
        salarioBaseMensual: Number(salario),
        tipoMoneda: moneda,
        tipoContrato,
        fechaIngreso,
        fechaRetiro: fechaRetiro || null,
        activo
      });

      setSuccess('Contrato laboral registrado correctamente.');
      resetNewForm();
      setActiveTab('list');
      await fetchContratos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al registrar el contrato laboral.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCerrar = async (e) => {
    e.preventDefault();
    if (!fechaRetiroEfectiva) {
      setError('La fecha de terminación efectiva es requerida.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await cerrarContrato(closeTarget.id, fechaRetiroEfectiva);
      setSuccess('Contrato finalizado y cerrado con éxito.');
      resetSubForms();
      await fetchContratos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al cerrar el contrato.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExtender = async (e) => {
    e.preventDefault();
    if (!nuevaFechaRetiro) {
      setError('La nueva fecha de vencimiento es obligatoria.');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await extenderContrato(
        extendTarget.id, 
        nuevaFechaRetiro, 
        nuevoSalario ? Number(nuevoSalario) : undefined
      );
      setSuccess('Prorroga o extensión contractual registrada.');
      resetSubForms();
      await fetchContratos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al prorrogar el contrato.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Está absolutamente seguro de eliminar físicamente este contrato? Esta acción es irreversible y borrará los registros contables vinculados en la pre-nómina.')) {
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      await eliminarContrato(id);
      setSuccess('Contrato laboral eliminado.');
      await fetchContratos();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al eliminar el contrato.');
    } finally {
      setActionLoading(false);
    }
  };

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

  if (!isOpen || !employee) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs text-left">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-150 bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-150 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-200 flex items-center justify-center text-purple-600">
              <Briefcase className="h-5.5 w-5.5" />
            </div>
            <div>
              <span className="text-4xs font-mono font-black text-slate-400 uppercase tracking-widest">Contratación & Nómina</span>
              <h3 className="text-md font-extrabold text-[#0f2942] uppercase tracking-wide flex items-center gap-1.5 mt-0.5">
                Contratos de {employee.nombreCompleto}
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

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-150 bg-slate-50/20 flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
          <button
            type="button"
            onClick={() => { setActiveTab('list'); resetSubForms(); setError(''); }}
            className={`py-3.5 border-b-2 transition ${activeTab === 'list' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent hover:text-[#0f2942]'}`}
          >
            <span className="flex items-center gap-1.5">
              <History className="h-4 w-4" /> Historial de Contratos
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('new'); resetSubForms(); setError(''); }}
            className={`py-3.5 border-b-2 transition ${activeTab === 'new' ? 'border-purple-600 text-purple-700 font-extrabold' : 'border-transparent hover:text-[#0f2942]'}`}
          >
            <span className="flex items-center gap-1.5">
              <FilePlus2 className="h-4 w-4" /> Registrar Nuevo Contrato
            </span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto flex-1 font-semibold text-xs text-slate-700 space-y-4">
          
          {/* Notifications */}
          {error && (
            <div className="rounded-xl bg-red-50 p-3 text-5xs font-black uppercase text-red-750 border border-red-250 flex items-center gap-2 animate-in fade-in duration-100">
              <ShieldAlert className="h-4 w-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="rounded-xl bg-emerald-50 p-3 text-5xs font-black uppercase text-emerald-700 border border-emerald-250 flex items-center gap-2 animate-in fade-in duration-100">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'list' ? (
            /* Tab 1: Historial */
            <div className="space-y-4">
              
              {/* Form de cerrar contrato */}
              {closeTarget && (
                <form onSubmit={handleCerrar} className="rounded-2xl border border-rose-200 bg-rose-50/20 p-4 space-y-3.5 animate-in slide-in-from-top-3 duration-150">
                  <div className="flex items-center justify-between border-b border-rose-100 pb-1.5 text-rose-800">
                    <span className="text-4xs font-black uppercase tracking-wider flex items-center gap-1">
                      <UserMinus className="h-4 w-4" /> Finalizar Contrato Activo
                    </span>
                    <button type="button" onClick={() => setCloseTarget(null)} className="text-rose-450 hover:text-rose-700 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="block text-4xs font-bold text-rose-700 uppercase tracking-wider">Fecha Efectiva de Retiro / Término</label>
                      <input
                        type="date"
                        value={fechaRetiroEfectiva}
                        onChange={(e) => setFechaRetiroEfectiva(e.target.value)}
                        className="w-full rounded-xl border border-rose-200 bg-white py-2 px-3 text-xs font-bold text-rose-900 focus:outline-none focus:ring-1 focus:ring-rose-500"
                        required
                      />
                    </div>
                    <div className="flex gap-2 font-bold text-4xs uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => setCloseTarget(null)}
                        className="flex-1 py-2 px-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-750 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-2 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Confirmar Cierre
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Form de extender contrato */}
              {extendTarget && (
                <form onSubmit={handleExtender} className="rounded-2xl border border-purple-200 bg-purple-50/20 p-4 space-y-3.5 animate-in slide-in-from-top-3 duration-150">
                  <div className="flex items-center justify-between border-b border-purple-100 pb-1.5 text-purple-800">
                    <span className="text-4xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Extender / Prorrogar Contrato
                    </span>
                    <button type="button" onClick={() => setExtendTarget(null)} className="text-purple-450 hover:text-purple-700 transition">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div className="space-y-1.5">
                      <label className="block text-4xs font-bold text-purple-700 uppercase tracking-wider">Nueva Fecha de Vencimiento</label>
                      <input
                        type="date"
                        value={nuevaFechaRetiro}
                        onChange={(e) => setNuevaFechaRetiro(e.target.value)}
                        className="w-full rounded-xl border border-purple-200 bg-white py-2 px-3 text-xs font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-4xs font-bold text-purple-700 uppercase tracking-wider">Reajuste de Salario (Opcional)</label>
                      <input
                        type="number"
                        placeholder="Ej. 2800000"
                        value={nuevoSalario}
                        onChange={(e) => setNuevoSalario(e.target.value)}
                        className="w-full rounded-xl border border-purple-200 bg-white py-2 px-3 text-xs font-bold text-purple-900 focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                    <div className="flex gap-2 font-bold text-4xs uppercase tracking-wider">
                      <button
                        type="button"
                        onClick={() => setExtendTarget(null)}
                        className="flex-1 py-2 px-4 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-750 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-2 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        {actionLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Extender
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Table list */}
              <div className="rounded-2xl border border-slate-150 overflow-hidden bg-slate-50/20">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-[#0f2942]/5 font-bold uppercase tracking-wider text-[#0f2942] text-3xs">
                    <tr>
                      <th className="px-4 py-3 text-left">Tipo Contrato</th>
                      <th className="px-4 py-3 text-right">Salario Base</th>
                      <th className="px-4 py-3 text-center">F. Ingreso</th>
                      <th className="px-4 py-3 text-center">F. Retiro</th>
                      <th className="px-4 py-3 text-center">Estado</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 bg-white">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-10 text-center">
                          <div className="flex flex-col items-center gap-1 text-slate-400">
                            <Loader2 className="h-5 w-5 animate-spin text-[#1ba0f2]" />
                            <span className="text-4xs font-black uppercase tracking-wider">Buscando contratos...</span>
                          </div>
                        </td>
                      </tr>
                    ) : contratos.length > 0 ? (
                      contratos.map(c => (
                        <tr key={c.id} className="hover:bg-[#0f2942]/5 transition text-3xs">
                          {/* Tipo */}
                          <td className="px-4 py-3 font-extrabold text-[#0f2942]">
                            {getTipoContratoLabel(c.tipoContrato)}
                          </td>
                          {/* Salario */}
                          <td className="px-4 py-3 text-right font-mono font-bold text-slate-650">
                            {formatCurrency(c.salarioBaseMensual, c.tipoMoneda)}
                          </td>
                          {/* Ingreso */}
                          <td className="px-4 py-3 text-center text-slate-500 font-mono">
                            {c.fechaIngreso}
                          </td>
                          {/* Retiro */}
                          <td className="px-4 py-3 text-center text-slate-500 font-mono">
                            {c.fechaRetiro ? c.fechaRetiro : <span className="text-slate-400 font-semibold select-none">Indefinido</span>}
                          </td>
                          {/* Estado */}
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex rounded px-2 py-0.5 text-5xs font-black uppercase tracking-wider border ${
                              c.activo
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-250'
                                : 'bg-slate-50 text-slate-450 border-slate-200'
                            }`}>
                              {c.activo ? 'Vigente' : 'Terminado'}
                            </span>
                          </td>
                          {/* Acciones */}
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-5xs">
                              {c.activo && (
                                <>
                                  {c.tipoContrato === 'TERMINO_FIJO' && (
                                    <button
                                      type="button"
                                      onClick={() => { resetSubForms(); setExtendTarget(c); }}
                                      className="py-1 px-2.5 rounded border border-purple-200 hover:border-purple-300 bg-purple-50 text-purple-700 transition cursor-pointer"
                                    >
                                      Prorrogar
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => { resetSubForms(); setCloseTarget(c); }}
                                    className="py-1 px-2.5 rounded border border-rose-200 hover:border-rose-300 bg-rose-50 text-rose-700 transition cursor-pointer"
                                  >
                                    Cerrar Contrato
                                  </button>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => handleEliminar(c.id)}
                                className="py-1 px-1.5 rounded border border-slate-200 text-slate-450 hover:text-red-650 hover:border-red-400 hover:bg-red-50 transition cursor-pointer"
                                title="Eliminar Contrato"
                              >
                                <Trash2Icon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center text-slate-400">
                          <span className="block font-bold">Sin contratos registrados</span>
                          <span className="block text-4xs text-slate-450 mt-1 font-semibold">El colaborador no tiene historial de contratación aún.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            /* Tab 2: Registrar Nuevo Contrato */
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="bg-slate-50/50 rounded-2xl p-4.5 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                
                {/* Salario */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Salario Base Mensual</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      placeholder="Ej. 2000000"
                      value={salario}
                      onChange={(e) => setSalario(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Moneda */}
                <div className="space-y-1.5">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Moneda</label>
                  <select
                    value={moneda}
                    onChange={(e) => setMoneda(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none cursor-pointer"
                  >
                    <option value="COP">COP ($)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                {/* Tipo de Contrato */}
                <div className="space-y-1.5">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Contrato</label>
                  <select
                    value={tipoContrato}
                    onChange={(e) => setTipoContrato(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none cursor-pointer"
                  >
                    <option value="TERMINO_INDEFINIDO">Término Indefinido</option>
                    <option value="TERMINO_FIJO">Término Fijo</option>
                    <option value="PRESTACION_SERVICIOS">Prestación de Servicios</option>
                    <option value="APRENDIZAJE">Contrato de Aprendizaje</option>
                  </select>
                </div>

                {/* Fecha de ingreso */}
                <div className="space-y-1.5">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Fecha de Ingreso</label>
                  <input
                    type="date"
                    value={fechaIngreso}
                    onChange={(e) => setFechaIngreso(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2]"
                    required
                  />
                </div>

                {/* Fecha de retiro */}
                <div className="space-y-1.5">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                    Fecha de Retiro / Vencimiento
                  </label>
                  <input
                    type="date"
                    value={fechaRetiro}
                    onChange={(e) => setFechaRetiro(e.target.value)}
                    disabled={tipoContrato === 'TERMINO_INDEFINIDO'}
                    placeholder="Indefinido"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] disabled:opacity-40"
                    required={tipoContrato === 'TERMINO_FIJO' || tipoContrato === 'APRENDIZAJE'}
                  />
                </div>

                {/* Activo (Vigente por defecto) */}
                <div className="space-y-1.5 sm:col-span-2 flex items-center gap-2 pt-5">
                  <input
                    id="contrato-activo-input"
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-350 text-purple-650 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="contrato-activo-input" className="text-xs font-bold text-[#0f2942] uppercase tracking-wide cursor-pointer select-none">
                    Marcar como Contrato Vigente / Activo de inmediato
                  </label>
                </div>

              </div>

              <div className="flex gap-2 font-bold text-4xs uppercase tracking-wider justify-end pt-2">
                <button
                  type="button"
                  onClick={() => { setActiveTab('list'); resetNewForm(); }}
                  className="py-3 px-6 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-550 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="py-3 px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-500/10"
                >
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Registrar Contrato
                </button>
              </div>

            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex justify-end font-bold text-4xs uppercase tracking-wider">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-550 transition cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}

// Mini inner trash icon component (to avoid naming conflicts)
function Trash2Icon(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
