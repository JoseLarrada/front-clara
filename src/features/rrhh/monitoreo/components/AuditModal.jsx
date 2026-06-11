import { ShieldAlert, X, User, Camera, ExternalLink } from 'lucide-react';
import { useS3Url } from '../../../../services/mediaService';

const getTipoAnomaliaLabel = (type) => {
  switch (type) {
    case 'MOCK_LOCATION_DETECTADA': return 'GPS Falso / Simulado';
    case 'FACE_MISMATCH': return 'Rostro No Coincide';
    case 'FUERA_DE_GEOCERCA': return 'Fuera de Perímetro';
    default: return type;
  }
};

export default function AuditModal({ auditAnomaly, setAuditAnomaly, employees = [] }) {
  if (!auditAnomaly) return null;

  const employee = employees.find(e => e.empleadoId === auditAnomaly.empleadoId || e.id === auditAnomaly.empleadoId);
  const fotoPatronKey = employee?.fotoPatronUrl;

  const { url: patronUrl } = useS3Url(fotoPatronKey);
  const selfieKey = auditAnomaly.fotoCapturaUrl || `asistencias/${auditAnomaly.empleadoId}_captura.jpg`;
  const { url: selfieUrl } = useS3Url(selfieKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs text-left text-slate-850">
      <div className="bg-white border border-slate-150 rounded-3xl shadow-2xl max-w-xl w-full p-6 md:p-8 space-y-6 text-left relative text-slate-850 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Modal */}
        <div className="flex justify-between items-start">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-250 bg-rose-50 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-rose-700 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" /> Auditoría de Seguridad Acceso
            </span>
            <h3 className="text-xl font-black text-[#0f2942] tracking-tight mt-1.5">
              Falla Crítica de Acceso: {getTipoAnomaliaLabel(auditAnomaly.tipoAnomalia)}
            </h3>
          </div>
          <button 
            onClick={() => setAuditAnomaly(null)}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-650 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Detalles Técnicos */}
        <div className="space-y-4 font-semibold text-xs leading-relaxed text-slate-650">
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-3xs">
            <div>
              <span className="text-slate-400 block uppercase tracking-wider">Empleado</span>
              <strong className="text-[#0f2942] text-[11px]">{auditAnomaly.empleadoNombre}</strong>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider">Fecha y Hora Evento</span>
              <span className="text-slate-700 font-mono text-[10px]">
                {new Date(auditAnomaly.creadoEn).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider">ID Auditoría</span>
              <span className="text-slate-500 font-mono break-all">{auditAnomaly.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase tracking-wider">Identificador Empleado</span>
              <span className="text-slate-500 font-mono break-all">{auditAnomaly.empleadoId}</span>
            </div>
          </div>

          <div className="border border-slate-150 rounded-2xl p-4 bg-rose-50/20 text-slate-750">
            <span className="block text-[9px] text-rose-700 font-black uppercase tracking-widest mb-1">
              Descripción Técnica del Incidente
            </span>
            <p className="text-xs font-semibold leading-relaxed">{auditAnomaly.detallesTecnicos}</p>
          </div>

          {/* COMPARACIÓN BIOMÉTRICA DE FOTOS (AWS Rekognition Simulation) */}
          {auditAnomaly.tipoAnomalia === 'FACE_MISMATCH' && (
            <div className="space-y-3">
              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Análisis de Coincidencia Facial
              </span>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Foto Patrón */}
                <div className="text-center space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Foto de Registro</span>
                  <div className="h-32 bg-slate-50 rounded-2xl overflow-hidden border border-slate-150 flex items-center justify-center relative">
                    {patronUrl ? (
                      <img src={patronUrl} alt="Registro oficial" className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-350" />
                    )}
                    <div className="absolute bottom-2 inset-x-2 bg-[#0f2942]/70 backdrop-blur-xs py-0.5 rounded text-[8px] font-black uppercase text-white tracking-widest text-center">
                      PATRÓN OFICIAL
                    </div>
                  </div>
                </div>
                
                {/* Selfie Capturada */}
                <div className="text-center space-y-1.5">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Selfie Capturada</span>
                  <div className="h-32 bg-rose-50/50 rounded-2xl overflow-hidden border border-rose-250 flex items-center justify-center relative">
                    {selfieUrl ? (
                      <img src={selfieUrl} alt="Selfie Capturada" className="h-full w-full object-cover" />
                    ) : (
                      <Camera className="h-10 w-10 text-rose-450" />
                    )}
                    <div className="absolute inset-0 bg-rose-500/10 flex items-center justify-center pointer-events-none">
                      <span className="bg-rose-600 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                        NO COINCIDE
                      </span>
                    </div>
                    <div className="absolute bottom-2 inset-x-2 bg-rose-900/80 backdrop-blur-xs py-0.5 rounded text-[8px] font-black uppercase text-white tracking-widest text-center">
                      DESPRENDIBLE
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de Score */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-3xs font-extrabold uppercase tracking-wider">
                  <span className="text-slate-450">Score de Coincidencia Facial</span>
                  <span className="text-rose-600 font-mono">61.45% / 80% Min</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '61.45%' }} />
                </div>
              </div>
            </div>
          )}

          {/* GPS Mock Location Details */}
          {auditAnomaly.tipoAnomalia === 'MOCK_LOCATION_DETECTADA' && (
            <div className="space-y-3">
              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Evidencia de Simulación GPS
              </span>
              <div className="rounded-2xl border border-slate-150 p-4 bg-slate-50/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-3xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase">Sensor Accuracy</span>
                  <span className="font-mono text-rose-600 font-black">0.00 metros (Sospechosamente perfecto)</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block uppercase">Proveedor de GPS</span>
                  <span className="text-[#0f2942] font-black">Proveedor Virtual (Mock Location Service)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón de Cierre */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              if (selfieUrl) {
                window.open(selfieUrl, '_blank');
              } else {
                alert('No se pudo generar el enlace firmado de visualización.');
              }
            }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-2xs border-none cursor-pointer"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Ver Foto en S3</span>
          </button>
          <button
            type="button"
            onClick={() => setAuditAnomaly(null)}
            className="px-5 py-2.5 bg-[#0f2942] hover:bg-[#153a5c] text-white text-xs font-bold rounded-xl transition shadow-md cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
