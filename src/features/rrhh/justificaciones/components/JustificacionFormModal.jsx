import { useState, useEffect, useRef } from 'react';
import { X, FileText, ShieldAlert, Loader2, RefreshCw, Upload } from 'lucide-react';
import { uploadJustificacion } from '../../../../services/mediaService';

function JustificacionFormModal({
  isOpen,
  onClose,
  onSubmit,
  employees,
  loadingEmployees,
  apiError,
  actionLoading
}) {
  const [formData, setFormData] = useState({
    empleadoId: '',
    registroAsistenciaId: '',
    motivoEmpleado: '',
    urlComprobanteS3: 'https://s3.amazonaws.com/cloudtime-buckets/justificaciones/soporte_demo.pdf'
  });

  const [localError, setLocalError] = useState('');
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);

  // Auto-generate a dummy UUID for the attendance record to ease testing
  const generateRandomAttendanceId = () => {
    return crypto.randomUUID();
  };

  useEffect(() => {
    if (isOpen) {
      setFormData({
        empleadoId: employees.length > 0 ? employees[0].id : '',
        registroAsistenciaId: generateRandomAttendanceId(),
        motivoEmpleado: '',
        urlComprobanteS3: 'https://s3.amazonaws.com/cloudtime-buckets/justificaciones/soporte_demo.pdf'
      });
      setLocalError('');
    }
  }, [isOpen, employees]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
  };

  const handleRefreshAttendanceId = () => {
    setFormData(prev => ({
      ...prev,
      registroAsistenciaId: generateRandomAttendanceId()
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    setLocalError('');
    try {
      const res = await uploadJustificacion(file);
      setFormData(prev => ({
        ...prev,
        urlComprobanteS3: res.fileKey || res.url || ''
      }));
    } catch (err) {
      console.error('Error uploading justification file:', err);
      setLocalError('Error al subir el archivo de comprobante a S3. Intente de nuevo.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.empleadoId) {
      setLocalError('Debe seleccionar un colaborador.');
      return;
    }
    if (!formData.registroAsistenciaId.trim()) {
      setLocalError('El ID de registro de asistencia es obligatorio.');
      return;
    }
    if (!formData.motivoEmpleado.trim()) {
      setLocalError('El motivo de la justificación es obligatorio.');
      return;
    }
    if (!formData.urlComprobanteS3.trim()) {
      setLocalError('La URL del comprobante de soporte es obligatoria.');
      return;
    }
    
    onSubmit(formData);
  };

  const activeError = localError || apiError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0f2942]/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10 text-left font-semibold text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
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
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              Registrar Justificación
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              Ingrese una solicitud de justificación manual en nombre del empleado
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-5 rounded-xl bg-red-50 p-3 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Empleado Dropdown */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Colaborador</label>
            {loadingEmployees ? (
              <div className="h-9 w-full bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select
                name="empleadoId"
                value={formData.empleadoId}
                onChange={handleChange}
                disabled={actionLoading}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-bold text-[#0f2942] focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition cursor-pointer"
              >
                <option value="">Seleccione un colaborador...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombreCompleto} ({emp.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Registro Asistencia ID */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Registro Asistencia ID (Incidencia)</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="registroAsistenciaId"
                value={formData.registroAsistenciaId}
                onChange={handleChange}
                disabled={actionLoading}
                placeholder="bc108cf2-29da-411a-a002-c6cb92f98ccf"
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-mono focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
              <button
                type="button"
                onClick={handleRefreshAttendanceId}
                disabled={actionLoading}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-650 cursor-pointer transition flex-shrink-0"
                title="Generar ID aleatorio"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Motivo */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Motivo de la Justificación</label>
            <textarea
              name="motivoEmpleado"
              value={formData.motivoEmpleado}
              onChange={handleChange}
              disabled={actionLoading}
              rows={3}
              placeholder="Describa el motivo, ej: Cita médica de control programada..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition resize-none"
            />
          </div>

          {/* URL Comprobante */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Comprobante de Soporte</label>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploadingFile || actionLoading}
                  className="text-[10px] font-black text-[#1ba0f2] hover:text-[#1ba0f2]/80 uppercase tracking-wider flex items-center gap-0.5 cursor-pointer bg-transparent border-none p-0 disabled:opacity-50"
                >
                  {uploadingFile ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3" />
                  )}
                  {uploadingFile ? 'Subiendo...' : 'Subir Archivo'}
                </button>
              </div>
            </div>
            <input
              type="text"
              name="urlComprobanteS3"
              value={formData.urlComprobanteS3}
              onChange={handleChange}
              disabled={actionLoading}
              placeholder="justificaciones/uuid.pdf"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-mono focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          {/* Actions */}
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
              Registrar Justificación
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default JustificacionFormModal;
