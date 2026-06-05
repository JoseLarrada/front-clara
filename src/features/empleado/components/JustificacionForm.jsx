import { useState } from 'react';
import { empleadoService } from '../services/empleadoService';
import { Upload, AlertCircle, CheckCircle, RefreshCw, FileText } from 'lucide-react';

export default function JustificacionForm({ panelData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motivo) {
      setError('Por favor, ingresa el motivo de la justificación.');
      return;
    }
    if (!file) {
      setError('Por favor, carga un documento de evidencia (PDF o Imagen).');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 1. Subir archivo a S3
      console.log('Subiendo evidencia a S3...', file.name);
      const uploadRes = await empleadoService.uploadJustificacionFile(file);
      const urlComprobanteS3 = uploadRes.url;
      console.log('Subido correctamente a S3, url:', urlComprobanteS3);

      // 2. Obtener el registro de asistencia del panel
      // Si la jornada de hoy está iniciada o tiene tardanza
      const registroHoyId = panelData?.registroHoyResumen?.id;
      if (!registroHoyId) {
        throw new Error('No se detectó un registro de asistencia de hoy para asociar la justificación. Asegúrate de marcar asistencia primero.');
      }

      // 3. Crear solicitud
      const res = await empleadoService.solicitarJustificacion({
        registroAsistenciaId: registroHoyId,
        motivoEmpleado: motivo,
        urlComprobanteS3
      });

      setSuccess(`Justificación enviada con éxito. Estado: ${res.estadoSolicitud}`);
      setMotivo('');
      setFile(null);
      setFileName('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Error al procesar la justificación.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm relative text-slate-800">
      <h3 className="text-[#0f2942] text-lg font-extrabold mb-1 flex items-center gap-2">
        <FileText className="w-5 h-5 text-[#1ba0f2]" /> Justificar Incidencia
      </h3>
      <p className="text-slate-500 text-xs font-semibold mb-6">
        ¿Llegaste tarde o tuviste una falta hoy? Envía un comprobante y justifícala.
      </p>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-750 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 rounded-2xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-emerald-800 text-sm font-semibold">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
            Motivo / Explicación
          </label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            required
            rows={3}
            placeholder="Ej: Retraso debido a huelga de transporte / Cita médica general en EPS..."
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] transition-all text-xs font-semibold resize-none"
          />
        </div>

        <div>
          <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block mb-2">
            Documento de Soporte / Comprobante
          </label>
          <div className="relative border-2 border-dashed border-slate-200 hover:border-[#1ba0f2]/40 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-slate-50 group">
            <input
              type="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.png,.jpg,.jpeg"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#1ba0f2] transition-all mb-2" />
            <span className="text-xs text-slate-700 font-bold">
              {fileName || 'Seleccionar archivo (PDF, PNG, JPG)'}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Arrastra o haz clic para buscar</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md hover:shadow-[#1ba0f2]/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
        >
          {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
          Enviar Justificación
        </button>
      </form>
    </div>
  );
}
