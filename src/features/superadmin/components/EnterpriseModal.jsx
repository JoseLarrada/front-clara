import { useState, useEffect } from 'react';
import { X, Building2, Hash, ShieldAlert, Loader2 } from 'lucide-react';

function EnterpriseModal({ isOpen, onClose, onSubmit, activeEmpresa, apiError, actionLoading }) {
  const [formData, setFormData] = useState({
    nombre: '',
    nitRut: '',
    rubro: 'INDUSTRIAL',
    limiteEmpleados: 50,
    estadoLicencia: 'ACTIVO',
  });
  const [localError, setLocalError] = useState('');

  // Sincronizar datos al abrir o cambiar la empresa seleccionada
  useEffect(() => {
    if (activeEmpresa) {
      setFormData({
        nombre: activeEmpresa.nombre || '',
        nitRut: activeEmpresa.nitRut || '',
        rubro: activeEmpresa.rubro || 'INDUSTRIAL',
        limiteEmpleados: activeEmpresa.limiteEmpleados || 10,
        estadoLicencia: activeEmpresa.estadoLicencia || 'ACTIVO',
      });
    } else {
      setFormData({
        nombre: '',
        nitRut: '',
        rubro: 'INDUSTRIAL',
        limiteEmpleados: 50,
        estadoLicencia: 'ACTIVO',
      });
    }
    setLocalError('');
  }, [activeEmpresa, isOpen]);

  if (!isOpen) return null;

  const rubros = ['INDUSTRIAL', 'SERVICIOS', 'COMERCIO', 'ALIMENTOS', 'LOGISTICA', 'SALUD'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones del cliente
    if (!formData.nombre.trim()) {
      setLocalError('El nombre de la empresa es obligatorio.');
      return;
    }
    if (!activeEmpresa && !formData.nitRut.trim()) {
      setLocalError('El NIT / RUT es obligatorio para crear la empresa.');
      return;
    }
    if (Number(formData.limiteEmpleados) <= 0) {
      setLocalError('El límite de empleados debe ser mayor a 0.');
      return;
    }

    onSubmit(formData);
  };

  const activeError = localError || apiError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#0f2942]/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10 text-left font-semibold text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              {activeEmpresa ? 'Editar Empresa' : 'Registrar Empresa'}
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              {activeEmpresa ? 'Actualice los datos comerciales y de licencia' : 'Registre una nueva empresa multi-tenant'}
            </p>
          </div>
        </div>

        {/* Error alert */}
        {activeError && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Nombre */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Nombre de Empresa</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              disabled={actionLoading}
              placeholder="Ej: Fábrica Metalúrgica del Norte"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          {/* NIT / RUT (Disabled on Edit mode per REST contract) */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">NIT / RUT</label>
            <div className="relative">
              <Hash className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                name="nitRut"
                value={formData.nitRut}
                onChange={handleChange}
                disabled={!!activeEmpresa || actionLoading}
                placeholder="Ej: 901445882-3"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 disabled:bg-slate-100 disabled:text-slate-450 py-2.5 pl-9 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
            {!activeEmpresa && (
              <span className="block text-[10px] text-slate-400 font-bold leading-normal">
                El NIT/RUT es único y no se podrá modificar una vez registrado.
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Rubro */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Rubro Comercial</label>
              <select
                name="rubro"
                value={formData.rubro}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                {rubros.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Límite Empleados */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Límite Empleados</label>
              <input
                type="number"
                name="limiteEmpleados"
                value={formData.limiteEmpleados}
                onChange={handleChange}
                disabled={actionLoading}
                min="1"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Estado de Licencia (Solo visible al crear; en edición se maneja con la acción toggle del listado) */}
          {!activeEmpresa && (
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Estado Licencia Inicial</label>
              <select
                name="estadoLicencia"
                value={formData.estadoLicencia}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                <option value="ACTIVO">ACTIVO (Habilitada inmediatamente)</option>
                <option value="SUSPENDIDO">SUSPENDIDO (Bloqueada)</option>
              </select>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-600 bg-white py-2.5 px-5 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-2.5 px-6 font-bold shadow-md shadow-[#1ba0f2]/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {activeEmpresa ? 'Actualizar Empresa' : 'Registrar Empresa'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default EnterpriseModal;
