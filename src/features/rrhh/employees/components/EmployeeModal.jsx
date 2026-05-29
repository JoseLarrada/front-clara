import { useState, useEffect, useRef } from 'react';
import { X, User, Mail, Lock, Sparkles, ShieldAlert, Loader2, Image, Palmtree, Upload } from 'lucide-react';
import { uploadFotoEmpleado } from '../../../../services/mediaService';

function EmployeeModal({ isOpen, onClose, onSubmit, activeEmployee, apiError, actionLoading }) {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    password: '',
    rol: 'EMPLEADO',
    modalidadPerfil: 'HIBRIDO',
    fotoPatronUrl: '',
    saldoVacaciones: 15,
    activo: true
  });
  
  const [localError, setLocalError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (activeEmployee) {
      setFormData({
        nombreCompleto: activeEmployee.nombreCompleto || '',
        email: activeEmployee.email || '',
        password: '', // Contraseña no editable en el PUT
        rol: activeEmployee.rol || 'EMPLEADO',
        modalidadPerfil: activeEmployee.modalidadPerfil || 'HIBRIDO',
        fotoPatronUrl: activeEmployee.fotoPatronUrl || '',
        saldoVacaciones: activeEmployee.saldoVacaciones || 15,
        activo: activeEmployee.activo !== undefined ? activeEmployee.activo : true
      });
    } else {
      setFormData({
        nombreCompleto: '',
        email: '',
        password: '',
        rol: 'EMPLEADO',
        modalidadPerfil: 'HIBRIDO',
        fotoPatronUrl: '',
        saldoVacaciones: 15,
        activo: true
      });
    }
    setLocalError('');
  }, [activeEmployee, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (localError) setLocalError('');
  };

  const handleGenerateRandomPhoto = () => {
    // Generar una foto aleatoria realista usando faces de unsplash para agilizar pruebas
    const randomId = Math.floor(Math.random() * 70);
    const mockUrl = `https://i.pravatar.cc/150?img=${randomId}`;
    setFormData(prev => ({ ...prev, fotoPatronUrl: mockUrl }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploadingImage(true);
    setLocalError('');
    try {
      const res = await uploadFotoEmpleado(file);
      setFormData(prev => ({
        ...prev,
        fotoPatronUrl: res.url
      }));
    } catch (err) {
      console.error('Error uploading employee photo:', err);
      setLocalError('Error al subir la foto a S3. Intente de nuevo.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombreCompleto.trim()) {
      setLocalError('El nombre completo es obligatorio.');
      return;
    }
    if (!formData.email.trim()) {
      setLocalError('El correo electrónico es obligatorio.');
      return;
    }
    // Validar formato del email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (!activeEmployee && (!formData.password || formData.password.length < 8)) {
      setLocalError('La contraseña es obligatoria y debe tener al menos 8 caracteres.');
      return;
    }
    if (Number(formData.saldoVacaciones) < 0) {
      setLocalError('El saldo de vacaciones debe ser igual o mayor a 0.');
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
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              {activeEmployee ? 'Editar Colaborador' : 'Registrar Colaborador'}
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              {activeEmployee ? 'Modifique los datos del perfil laboral' : 'Registre un nuevo empleado en la base de datos'}
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
          
          {/* Nombre completo */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="nombreCompleto"
                value={formData.nombreCompleto}
                onChange={handleChange}
                disabled={actionLoading}
                placeholder="Ej: Carlos Pérez González"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={actionLoading}
                placeholder="carlos.perez@empresa.com"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Contraseña (Solo en creación) */}
          {!activeEmployee && (
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Contraseña Temporal</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={actionLoading}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
              </div>
            </div>
          )}

          {/* Grid Rol / Modalidad */}
          <div className="grid grid-cols-2 gap-4">
            {/* Rol */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Rol de Sistema</label>
              <select
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                <option value="EMPLEADO">EMPLEADO</option>
                <option value="ADMIN_RRHH">ADMIN_RRHH</option>
                <option value="SUPERADMIN">SUPERADMIN</option>
              </select>
            </div>

            {/* Modalidad de perfil */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Modalidad Laboral</label>
              <select
                name="modalidadPerfil"
                value={formData.modalidadPerfil}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              >
                <option value="PRESENCIAL">PRESENCIAL</option>
                <option value="HIBRIDO">HIBRIDO</option>
                <option value="REMOTO">REMOTO</option>
              </select>
            </div>
          </div>

          {/* Grid Vacaciones / Activo */}
          <div className="grid grid-cols-2 gap-4 items-center">
            {/* Saldo de vacaciones */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Saldo Vacaciones</label>
              <div className="relative">
                <Palmtree className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  name="saldoVacaciones"
                  value={formData.saldoVacaciones}
                  onChange={handleChange}
                  disabled={actionLoading}
                  min="0"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                />
              </div>
            </div>

            {/* Estado Activo */}
            <div className="pt-5 flex items-center">
              <input
                type="checkbox"
                name="activo"
                id="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={actionLoading}
                className="h-4 w-4 rounded border-slate-300 text-[#1ba0f2] focus:ring-[#1ba0f2] cursor-pointer"
              />
              <label htmlFor="activo" className="ml-2 block text-2xs font-extrabold text-slate-700 uppercase tracking-wide cursor-pointer">
                Colaborador Activo
              </label>
            </div>
          </div>

          {/* Foto Patrón (Opcional, en base a S3) */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Foto Patrón Facial</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploadingImage || actionLoading}
                  className="text-[10px] font-black text-[#1ba0f2] hover:text-[#1ba0f2]/80 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {uploadingImage ? 'Subiendo...' : 'Subir Foto'}
                </button>
                <span className="text-slate-300 font-bold text-5xs">|</span>
                <button
                  type="button"
                  onClick={handleGenerateRandomPhoto}
                  disabled={actionLoading}
                  className="text-[10px] font-black text-[#1ba0f2] hover:text-[#1ba0f2]/80 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0"
                >
                  <Sparkles className="h-3 w-3" /> Foto Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="fotoPatronUrl"
                value={formData.fotoPatronUrl}
                onChange={handleChange}
                disabled={actionLoading}
                placeholder="https://s3.amazonaws.com/buckets/carlos_patron.jpg"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-650 bg-white py-2.5 px-5 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-2.5 px-6 font-bold shadow-md shadow-[#1ba0f2]/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {activeEmployee ? 'Guardar Cambios' : 'Registrar Colaborador'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default EmployeeModal;
