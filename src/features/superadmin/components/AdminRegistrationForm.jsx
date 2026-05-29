import { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Building2, 
  Camera, 
  CalendarRange, 
  ShieldCheck, 
  AlertCircle, 
  Loader2,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'avatar1', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', label: 'Erick' },
  { id: 'avatar2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', label: 'Ana' },
  { id: 'avatar3', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', label: 'Jorge' },
  { id: 'avatar4', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', label: 'Sofía' },
  { id: 'avatar5', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80', label: 'Carlos' }
];

function AdminRegistrationForm({ 
  empresas = [], 
  onSubmit, 
  error, 
  success, 
  setSuccess, 
  setError, 
  loading 
}) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    passwordHash: '',
    confirmPassword: '',
    rol: 'ADMIN_RRHH',
    modalidadPerfil: 'PRESENCIAL',
    fotourl: PRESET_AVATARS[0].url,
    empresa_id: '',
    saldoVacaciones: 15
  });

  const [localError, setLocalError] = useState('');

  // Limpiar estados cuando el rol cambia
  useEffect(() => {
    if (formData.rol === 'SUPERADMIN') {
      setFormData(prev => ({ ...prev, empresa_id: '', saldoVacaciones: 0 }));
    } else {
      // Auto-seleccionar la primera empresa si está vacía
      if (!formData.empresa_id && empresas.length > 0) {
        setFormData(prev => ({ ...prev, empresa_id: empresas[0].id, saldoVacaciones: 15 }));
      }
    }
  }, [formData.rol, empresas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
    if (error) setError('');
    if (success) setSuccess(false);
  };

  const handleAvatarSelect = (url) => {
    setFormData(prev => ({ ...prev, fotourl: url }));
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setError('');
    setSuccess(false);

    // 1. Validar campos requeridos
    if (!formData.nombreCompleto.trim()) {
      setLocalError('El nombre completo es obligatorio.');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('El correo electrónico es obligatorio.');
      return;
    }
    if (!formData.passwordHash) {
      setLocalError('La contraseña es obligatoria.');
      return;
    }

    // 2. Regla de negocio de nombre: sin números ni puntos
    const hasNumbersOrDots = /[0-9.]/.test(formData.nombreCompleto);
    if (hasNumbersOrDots) {
      setLocalError('El nombre completo no debe contener números ni puntos (caracteres especiales de puntuación).');
      return;
    }

    // 3. Validación de longitud de contraseñas
    if (formData.passwordHash.length < 8 || formData.passwordHash.length > 72) {
      setLocalError('La contraseña debe tener entre 8 y 72 caracteres.');
      return;
    }

    // 4. Confirmación de contraseña idéntica
    if (formData.passwordHash !== formData.confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    // 5. Empresa obligatoria si el rol no es SUPERADMIN
    if (formData.rol !== 'SUPERADMIN' && !formData.empresa_id) {
      setLocalError('Debe asociar este usuario a una Empresa/Tenant.');
      return;
    }

    // 6. Validar saldo de vacaciones positivo
    if (formData.rol !== 'SUPERADMIN' && (isNaN(formData.saldoVacaciones) || Number(formData.saldoVacaciones) < 0)) {
      setLocalError('El saldo de vacaciones inicial debe ser un número entero mayor o igual a 0.');
      return;
    }

    // Preparar payload final para enviar al API
    const payload = {
      ...formData,
      saldoVacaciones: formData.rol === 'SUPERADMIN' ? 0 : Number(formData.saldoVacaciones),
      empresa_id: formData.rol === 'SUPERADMIN' ? null : formData.empresa_id
    };

    const isOk = await onSubmit(payload);
    if (isOk) {
      // Limpiar formulario tras registro exitoso
      setFormData({
        nombreCompleto: '',
        email: '',
        passwordHash: '',
        confirmPassword: '',
        rol: 'ADMIN_RRHH',
        modalidadPerfil: 'PRESENCIAL',
        fotourl: PRESET_AVATARS[0].url,
        empresa_id: empresas[0]?.id || '',
        saldoVacaciones: 15
      });
    }
  };

  const activeError = localError || error;

  return (
    <div className="bg-white rounded-3xl border border-slate-150 p-6 sm:p-8 shadow-xl max-w-4xl mx-auto text-left font-semibold text-xs text-slate-700">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
            Registrar Nuevo Usuario / Administrador
          </h3>
          <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
            De de alta cuentas en el sistema bajo los roles de SuperAdmin, Administrador de RRHH o Empleado
          </p>
        </div>
      </div>

      {/* Alertas */}
      {activeError && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="block font-black text-red-700">Error de Validación</span>
            <span className="mt-1 block text-slate-600 font-semibold leading-normal">{activeError}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-2xs font-bold text-emerald-650 border border-emerald-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="block font-black text-emerald-800">¡Registro Exitoso!</span>
            <span className="mt-1 block text-slate-600 font-semibold leading-normal">
              El usuario ha sido registrado correctamente en la base de datos global de Clara.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Foto y Roles */}
          <div className="space-y-6 md:border-r md:border-slate-100 md:pr-6">
            
            {/* Foto de Perfil */}
            <div className="space-y-2 text-center md:text-left">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Foto de Perfil
              </label>
              
              <div className="flex flex-col items-center gap-3">
                {/* Preview */}
                <div className="relative group">
                  <img 
                    src={formData.fotourl || 'https://via.placeholder.com/150'} 
                    alt="Previsualización" 
                    className="h-24 w-24 rounded-full object-cover border-2 border-[#1ba0f2] shadow-md transition"
                  />
                  <div className="absolute inset-0 bg-[#0f2942]/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </div>

                {/* Preset Avatars Selection */}
                <div className="w-full">
                  <span className="block text-[10px] text-slate-400 font-bold text-center mb-2 uppercase tracking-wide">
                    Elegir un Avatar Predeterminado
                  </span>
                  <div className="flex justify-center gap-2">
                    {PRESET_AVATARS.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => handleAvatarSelect(av.url)}
                        title={av.label}
                        className={`h-8 w-8 rounded-full overflow-hidden border-2 transition cursor-pointer hover:scale-110 active:scale-95 ${
                          formData.fotourl === av.url ? 'border-[#1ba0f2] scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={av.url} alt={av.label} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* URL Directa */}
                <div className="w-full space-y-1">
                  <input
                    type="url"
                    name="fotourl"
                    value={formData.fotourl}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="O ingrese una URL de imagen personalizada"
                    className="w-full text-center md:text-left rounded-xl border border-slate-200 bg-white py-1.5 px-3 text-[10px] placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  />
                </div>
              </div>
            </div>

            {/* Rol de Usuario */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Rol del Usuario
              </label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                <option value="ADMIN_RRHH">ADMIN_RRHH (Administrador de Empresa)</option>
                <option value="EMPLEADO">EMPLEADO (Colaborador Regular)</option>
                <option value="SUPERADMIN">SUPERADMIN (Administrador Global)</option>
              </select>
            </div>

            {/* Modalidad de Perfil */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Modalidad del Perfil
              </label>
              <select
                name="modalidadPerfil"
                value={formData.modalidadPerfil}
                onChange={handleChange}
                disabled={loading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                <option value="PRESENCIAL">PRESENCIAL</option>
                <option value="HIBRIDO">HÍBRIDO</option>
                <option value="REMOTO">REMOTO</option>
              </select>
            </div>

          </div>

          {/* Columna Derecha / Central: Datos del Formulario */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Nombre Completo */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ej: Juan Sebastián Pérez"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
              </div>
              <span className="block text-[10px] text-slate-450 font-semibold leading-normal">
                * El backend no acepta números ni puntos (.) en el nombre.
              </span>
            </div>

            {/* Correo Electrónico */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Ej: juan.perez@empresa.com"
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Contraseñas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Contraseña */}
              <div className="space-y-1">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="passwordHash"
                    value={formData.passwordHash}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Mínimo 8 caracteres"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div className="space-y-1">
                <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Repita la contraseña"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  />
                </div>
              </div>

            </div>

            {/* Asociación a Empresa y Saldo de Vacaciones (Ocultos/Deshabilitados si es SUPERADMIN) */}
            {formData.rol !== 'SUPERADMIN' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
                
                {/* Empresa */}
                <div className="space-y-1">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Building2 className="h-3 w-3 text-slate-450" /> Empresa Asignada
                  </label>
                  <select
                    name="empresa_id"
                    value={formData.empresa_id}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-3.5 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  >
                    <option value="">-- Seleccionar Empresa --</option>
                    {empresas.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.nombre} ({emp.nitRut})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Saldo de vacaciones */}
                <div className="space-y-1">
                  <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <CalendarRange className="h-3 w-3 text-slate-450" /> Saldo Inicial de Vacaciones (Días)
                  </label>
                  <input
                    type="number"
                    name="saldoVacaciones"
                    value={formData.saldoVacaciones}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 px-3.5 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  />
                </div>

              </div>
            )}

            {formData.rol === 'SUPERADMIN' && (
              <div className="rounded-xl bg-[#0f2942]/5 border border-[#0f2942]/10 p-3.5 text-3xs font-semibold text-slate-500 flex gap-2">
                <AlertCircle className="h-4.5 w-4.5 text-[#1ba0f2] flex-shrink-0 mt-0.5" />
                <span>
                  Los administradores con rol <strong>SUPERADMIN</strong> tienen alcance global y no se asocian a empresas específicas ni manejan saldos de vacaciones.
                </span>
              </div>
            )}

            {/* Botón de Enviar */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-3 px-8 font-black text-xs shadow-md shadow-[#1ba0f2]/10 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4.5 w-4.5 animate-spin" />}
                Registrar Usuario
              </button>
            </div>

          </div>

        </div>
      </form>
    </div>
  );
}

export default AdminRegistrationForm;
