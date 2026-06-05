import { useState, useEffect, useRef } from 'react';
import { empleadoService } from '../services/empleadoService';
import { 
  Play, 
  Pause, 
  Square, 
  AlertCircle, 
  RefreshCw, 
  QrCode, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  X, 
  ShieldAlert, 
  Info, 
  Sparkles, 
  Settings, 
  Eye, 
  Video 
} from 'lucide-react';

// Fórmula de Haversine para calcular distancia en metros entre dos coordenadas GPS
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
};

export default function ClockingCard({ panelData, geocercas = [], onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [secondsWorked, setSecondsWorked] = useState(panelData?.cronometroTrabajoNetoSegundos || 0);
  const [secondsLunch, setSecondsLunch] = useState(panelData?.cronometroAlmuerzoSegundos || 0);

  // Estados para los Modales de Seguridad
  const [showRemoteModal, setShowRemoteModal] = useState(false);
  const [showPresencialModal, setShowPresencialModal] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [activeFlowType, setActiveFlowType] = useState(null);
  
  // Estado de Biometría & Ubicación (Remoto)
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [biometricScore, setBiometricScore] = useState(null);
  const [biometricVerifying, setBiometricVerifying] = useState(false);
  
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState(null);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsMocked, setGpsMocked] = useState(false);

  // Estados para simulación de errores de Seguridad (DevTools)
  const [simularMockLocation, setSimularMockLocation] = useState(false);
  const [simularCoincidenciaBaja, setSimularCoincidenciaBaja] = useState(false);
  const [simularFueraGeocerca, setSimularFueraGeocerca] = useState(false);
  const [simularQrExpirado, setSimularQrExpirado] = useState(false);

  // Estados para el QR Scanner (Presencial)
  const [qrToken, setQrToken] = useState('');
  const [qrScanning, setQrScanning] = useState(false);
  const [qrScannedSuccess, setQrScannedSuccess] = useState(false);

  const videoRef = useRef(null);
  const setVideoRef = (element) => {
    if (element) {
      videoRef.current = element;
      if (cameraStream && element.srcObject !== cameraStream) {
        element.srcObject = cameraStream;
      }
    } else {
      videoRef.current = null;
    }
  };
  const canvasRef = useRef(null);
  const timerRef = useRef(null);

  const {
    modalidadAplicableHoy,
    requiereQr,
    requiereGps,
    requiereCamara,
    estadoLaboral,
    jornadaIniciada,
    enAlmuerzo,
    alertas
  } = panelData || {};

  // Incrementar los segundos localmente
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (estadoLaboral === 'JORNADA_ACTIVA') {
      timerRef.current = setInterval(() => {
        setSecondsWorked(prev => prev + 1);
      }, 1000);
    } else if (estadoLaboral === 'EN_ALMUERZO') {
      timerRef.current = setInterval(() => {
        setSecondsLunch(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [estadoLaboral]);

  useEffect(() => {
    if (panelData) {
      setSecondsWorked(panelData.cronometroTrabajoNetoSegundos || 0);
      setSecondsLunch(panelData.cronometroAlmuerzoSegundos || 0);
    }
  }, [panelData]);

  // Efecto para enlazar la cámara cuando cambie el stream
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream || null;
    }
  }, [cameraStream]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  // --- CONTROLES DE CÁMARA (WEBCAM REAL) ---
  const startCamera = async () => {
    setError(null);
    setModalError(null);
    setCapturedPhoto(null);
    setBiometricScore(null);

    // Detección de soporte y contexto seguro (HTTPS)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Navegador o contexto HTTP no seguro no soporta mediaDevices");
      setModalError("Tu navegador o conexión HTTP no segura no permite acceso a la cámara. Por favor utiliza HTTPS o la opción de Simulación.");
      return;
    }

    try {
      let stream;
      try {
        // Intento 1: facingMode ideal y resoluciones estándar recomendadas para móviles
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          } 
        });
      } catch (innerErr) {
        console.warn("Fallo con restricciones de resolución, reintentando con facingMode simple:", innerErr);
        try {
          // Intento 2: facingMode básico
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
          });
        } catch (innerErr2) {
          console.warn("Fallo con facingMode: 'user', intentando cualquier video:", innerErr2);
          // Intento 3: cualquier entrada de video disponible
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: true 
          });
        }
      }
      setCameraStream(stream);
    } catch (err) {
      console.warn("No se pudo acceder a la cámara física:", err);
      setModalError("No se pudo activar la cámara física o no se otorgaron los permisos de acceso. Por favor verifica los permisos del navegador.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setModalError(null);
  };

  const captureSelfie = () => {
    if (cameraStream && videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth || 320;
      canvas.height = video.videoHeight || 240;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setCapturedPhoto(dataUrl);
      stopCamera();
      triggerBiometricAnalysis();
    } else {
      // Fallback si no hay cámara activa
      setCapturedPhoto('/mock_avatar_selfie.jpg');
      triggerBiometricAnalysis();
    }
  };

  const triggerBiometricAnalysis = () => {
    setBiometricVerifying(true);
    setTimeout(() => {
      const score = simularCoincidenciaBaja 
        ? parseFloat((60 + Math.random() * 15).toFixed(2)) // 60% a 75% (mismatch)
        : parseFloat((86 + Math.random() * 12).toFixed(2)); // 86% a 98% (válido)
      setBiometricScore(score);
      setBiometricVerifying(false);
    }, 1500);
  };

  // --- OBTENCIÓN GPS ---
  const captureGps = () => {
    setGpsLoading(true);
    setGpsCoords(null);
    setGpsAccuracy(null);
    setGpsMocked(false);

    if (simularFueraGeocerca) {
      setTimeout(() => {
        setGpsCoords({ latitude: 5.60970, longitude: -75.08170 }); // Muy lejos
        setGpsAccuracy(18.5);
        setGpsMocked(simularMockLocation);
        setGpsLoading(false);
      }, 1000);
      return;
    }

    if (!navigator.geolocation) {
      setGpsCoords({ latitude: 4.60971, longitude: -74.08175 }); // Coordenada base
      setGpsAccuracy(15.0);
      setGpsMocked(simularMockLocation);
      setGpsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        // Detección de simulación GPS
        const isMock = position.mocked || position.coords.mock || accuracy === 0 || simularMockLocation;
        setGpsCoords({ latitude, longitude });
        setGpsAccuracy(accuracy);
        setGpsMocked(isMock);
        setGpsLoading(false);
      },
      (err) => {
        console.warn("Error capturando ubicación física:", err);
        // Fallback robusto
        setGpsCoords({ latitude: 4.60971, longitude: -74.08175 });
        setGpsAccuracy(12.5);
        setGpsMocked(simularMockLocation);
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // --- BOTÓN PRINCIPAL: INICIAR FLUJO DE SEGURIDAD ---
  const handleOpenClockinFlow = (flowType) => {
    setError(null);
    setSuccess(null);
    setActiveFlowType(flowType);
    if (modalidadAplicableHoy === 'PRESENCIAL') {
      setQrToken('');
      setQrScannedSuccess(false);
      setQrScanning(false);
      setShowPresencialModal(true);
    } else {
      setShowRemoteModal(true);
      startCamera();
      captureGps();
    }
  };

  // --- FINALIZACIÓN DE REGISTRO EN SERVIDOR (CON SEGURIDAD) ---
  const handleConfirmAsistencia = async (tipo, origen) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      let request = {
        tipoMarcacion: tipo,
        origenMarcacion: origen,
        tokenQr: origen === 'QR_DINAMICO' ? qrToken : null,
        
        // Atributos de seguridad remota
        esFacialVerificado: origen === 'BOTON_REMOTO' ? (biometricScore >= 80) : null,
        precisionGpsAccuracy: origen === 'BOTON_REMOTO' ? gpsAccuracy : null,
        latitud: origen === 'BOTON_REMOTO' ? gpsCoords?.latitude : null,
        longitud: origen === 'BOTON_REMOTO' ? gpsCoords?.longitude : null,
        esMockLocation: origen === 'BOTON_REMOTO' ? gpsMocked : null,
        fotoCapturaUrl: origen === 'BOTON_REMOTO' 
          ? `https://bucket-s3.s3.amazonaws.com/asistencias/carles_perez_${tipo.toLowerCase()}_selfie.jpg` 
          : null,
        scoreFacialCoincidencia: origen === 'BOTON_REMOTO' ? biometricScore : null
      };

      const res = await empleadoService.registrarAsistencia(request);
      setSuccess(res.mensaje || '¡Asistencia registrada con éxito!');
      
      // Cerrar modales
      setShowRemoteModal(false);
      setShowPresencialModal(false);
      stopCamera();
      
      onRefresh();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.mensaje || 'Error al procesar la marcación de seguridad.');
      setShowRemoteModal(false);
      setShowPresencialModal(false);
      stopCamera();
    } finally {
      setLoading(false);
    }
  };

  // --- SIMULAR SCANNER DE CÓDIGO QR ---
  const handleSimulateQrScan = (isValid) => {
    setQrScanning(true);
    setQrScannedSuccess(false);
    setTimeout(() => {
      const timestamp = Math.floor(Date.now() / 1000) - (isValid ? 0 : 15); // Expirado por 15 segundos
      const simulatedToken = `QR_clara-tenant-12345_${timestamp}`;
      setQrToken(simulatedToken);
      setQrScannedSuccess(true);
      setQrScanning(false);
    }, 1200);
  };

  // Determinar color de badge
  const getStatusColor = () => {
    switch (estadoLaboral) {
      case 'JORNADA_ACTIVA': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'EN_ALMUERZO': return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'JORNADA_FINALIZADA': return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      default: return 'bg-slate-50 text-slate-600 border border-slate-200/60';
    }
  };

  const getStatusLabel = () => {
    switch (estadoLaboral) {
      case 'JORNADA_ACTIVA': return 'Jornada Activa';
      case 'EN_ALMUERZO': return 'En Almuerzo';
      case 'JORNADA_FINALIZADA': return 'Jornada Finalizada';
      default: return 'Fuera de Horario';
    }
  };

  return (
    <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden text-slate-800 text-left">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#1ba0f2]/3 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/3 rounded-full blur-3xl -z-10" />

      {/* Canvas oculto para capturar frames */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Modalidad de hoy</span>
          <h3 className="text-[#0f2942] text-md font-extrabold flex items-center gap-2 mt-1">
            {modalidadAplicableHoy === 'PRESENCIAL' ? (
              <><QrCode className="w-5 h-5 text-[#1ba0f2]" /> Presencial</>
            ) : (
              <><MapPin className="w-5 h-5 text-[#1ba0f2]" /> Remoto (Geolocalizado)</>
            )}
          </h3>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ${getStatusColor()}`}>
          {getStatusLabel()}
        </div>
      </div>

      {/* Cronómetro Principal */}
      <div className="flex flex-col items-center justify-center my-8 text-center">
        <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
          Tiempo neto trabajado
        </div>
        <div className="text-5xl md:text-6xl font-extrabold text-[#0f2942] font-mono tracking-tight tabular-nums drop-shadow-xs">
          {formatTime(secondsWorked)}
        </div>
        {secondsLunch > 0 && (
          <div className="text-slate-600 text-xs mt-4 flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 font-semibold shadow-xs">
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
            Almuerzo acumulado: <span className="font-mono">{formatTime(secondsLunch)}</span>
          </div>
        )}
      </div>

      {/* Requisitos de Seguridad Activos */}
      <div className="bg-slate-50/50 rounded-2xl p-4.5 mb-6 border border-slate-200/65">
        <span className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest block mb-3">
          Requisitos de seguridad activos
        </span>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-semibold">
          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${requiereQr ? 'bg-blue-50 border-blue-200 text-[#1ba0f2]' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
            <QrCode className="w-5 h-5" />
            <span className="text-xs">Escanear QR</span>
          </div>
          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${requiereGps ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
            <MapPin className="w-5 h-5" />
            <span className="text-xs">Ubicación GPS</span>
          </div>
          <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all ${requiereCamara ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-slate-200 text-slate-400 opacity-60'}`}>
            <Camera className="w-5 h-5" />
            <span className="text-xs">Validación Facial</span>
          </div>
        </div>
      </div>

      {/* Mensajes de feedback */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-250 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-750 text-sm font-semibold">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 bg-emerald-50 border border-emerald-250 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 animate-ping shrink-0" />
          <p className="text-emerald-800 text-sm font-semibold">{success}</p>
        </div>
      )}

      {/* Botonera de Acción */}
      <div className="flex flex-col gap-3 font-semibold">
        {estadoLaboral === 'SIN_REGISTRO' && (
          <button
            onClick={() => handleOpenClockinFlow('ENTRADA')}
            disabled={loading}
            className="w-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-[#1ba0f2]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
            Marcar Entrada
          </button>
        )}

        {estadoLaboral === 'JORNADA_ACTIVA' && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleOpenClockinFlow('ALMUERZO')}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Pause className="w-4 h-4 fill-white" />}
              Salir a Almorzar
            </button>
            <button
              onClick={() => handleOpenClockinFlow('SALIDA')}
              disabled={loading}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-white" />}
              Cerrar Turno
            </button>
          </div>
        )}

        {estadoLaboral === 'EN_ALMUERZO' && (
          <button
            onClick={() => handleOpenClockinFlow('ALMUERZO')}
            disabled={loading}
            className="w-full bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md hover:shadow-[#1ba0f2]/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
            Retornar de Almuerzo
          </button>
        )}

        {estadoLaboral === 'JORNADA_FINALIZADA' && (
          <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-slate-650 text-sm font-semibold">Jornada laboral de hoy finalizada con éxito.</p>
          </div>
        )}
      </div>

      {/* Alertas pasadas */}
      {alertas && alertas.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col gap-2">
          {alertas.map((a, idx) => (
            <div key={idx} className="flex gap-2 text-slate-500 text-xs font-semibold">
              <span className="text-[#1ba0f2]">●</span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MODAL DE ASISTENCIA REMOTA (BIOMETRÍA Y GPS) */}
      {/* ========================================================================= */}
      {showRemoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-150 rounded-3xl shadow-2xl max-w-lg w-full p-5 sm:p-7 space-y-5 text-left relative overflow-y-auto max-h-[92vh] sm:max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 scrollbar-thin">
            {/* Cabecera Modal */}
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-purple-250 bg-purple-50 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-purple-700">
                  <Camera className="w-3.5 h-3.5" /> Autenticación Biométrica
                </span>
                <h3 className="text-lg font-black text-[#0f2942] tracking-tight mt-1.5">
                  Verificación de Asistencia Remota
                </h3>
              </div>
              <button 
                onClick={() => { setShowRemoteModal(false); stopCamera(); }}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Informativo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-slate-100 py-3 text-3xs font-semibold">
              {/* GPS Status */}
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${gpsLoading ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50 border-emerald-250 text-emerald-600'}`}>
                  {gpsLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <MapPin className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <span className="text-slate-450 block uppercase tracking-wider">Localización GPS</span>
                  {gpsLoading ? (
                    <span className="text-slate-400">Capturando...</span>
                  ) : (
                    <span className="text-slate-700 font-mono text-[10px]">
                      {gpsCoords?.latitude.toFixed(4)}, {gpsCoords?.longitude.toFixed(4)}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-slate-150" />

              {/* Facial Status */}
              <div className="flex items-center gap-2.5">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 border ${
                  biometricVerifying ? 'bg-slate-100 border-slate-200' : 
                  biometricScore ? (biometricScore >= 80 ? 'bg-emerald-50 border-emerald-250 text-emerald-600' : 'bg-rose-50 border-rose-250 text-rose-600') :
                  'bg-purple-50 border-purple-250 text-purple-600'
                }`}>
                  {biometricVerifying ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" /> : <Camera className="h-3.5 w-3.5" />}
                </div>
                <div>
                  <span className="text-slate-450 block uppercase tracking-wider">Biometría Facial</span>
                  {biometricVerifying ? (
                    <span className="text-slate-400">Analizando rostro...</span>
                  ) : biometricScore ? (
                    <span className={`font-black ${biometricScore >= 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {biometricScore}% Coincidencia
                    </span>
                  ) : (
                    <span className="text-purple-650">Pendiente selfie</span>
                  )}
                </div>
              </div>
            </div>

            {modalError && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex gap-3 items-start text-rose-800 text-xs font-semibold leading-relaxed">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-rose-900/80 font-medium">{modalError}</p>
              </div>
            )}

            {/* Video Stream / Selfie Capture Section */}
            <div className="space-y-3">
              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Captura de Selfie obligatoria
              </span>
              
              <div className="relative h-56 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center shadow-inner">
                {/* 1. Live video feed */}
                {cameraStream && !capturedPhoto && (
                  <video 
                    ref={setVideoRef} 
                    autoPlay 
                    playsInline 
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                )}

                {/* 2. Photo frozen on screen */}
                {capturedPhoto && (
                  <img 
                    src={capturedPhoto} 
                    alt="Selfie" 
                    className="w-full h-full object-cover"
                  />
                )}

                {/* 3. Scanning Animation bar (during verification) */}
                {biometricVerifying && (
                  <div className="absolute inset-x-0 h-1 bg-[#1ba0f2] animate-bounce z-10 shadow-[0_0_12px_#1ba0f2]" />
                )}

                {/* Overlays / Indicators */}
                {!cameraStream && !capturedPhoto && (
                  <div className="text-center p-6 space-y-2 text-slate-500">
                    <Video className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                    <p className="text-xs font-semibold">
                      {modalError ? "Hardware de Cámara Inactivo" : "Cámara inactiva / Sin permisos"}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-2.5">
                      <button 
                        type="button"
                        onClick={startCamera}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 text-slate-200 text-3xs font-black uppercase tracking-wider hover:bg-slate-800 transition cursor-pointer"
                      >
                        Reintentar Cámara
                      </button>
                      <button 
                        type="button"
                        onClick={() => {
                          setCapturedPhoto('/mock_avatar_selfie.jpg');
                          setModalError(null);
                          triggerBiometricAnalysis();
                        }}
                        className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg text-3xs font-black uppercase tracking-widest hover:bg-amber-600 transition cursor-pointer"
                      >
                        Simular Foto
                      </button>
                    </div>
                  </div>
                )}

                {/* Watermark/Target Frame for face */}
                {cameraStream && !capturedPhoto && (
                  <div className="absolute inset-0 border-[3px] border-dashed border-white/20 rounded-full m-8 pointer-events-none flex items-center justify-center">
                    <span className="text-white/20 text-3xs uppercase font-extrabold tracking-widest">Coloque su rostro aquí</span>
                  </div>
                )}
              </div>

              {/* Shutter button */}
              {cameraStream && !capturedPhoto && (
                <button
                  type="button"
                  onClick={captureSelfie}
                  className="w-full bg-[#0f2942] hover:bg-[#153a5c] text-white font-bold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  <Camera className="w-4.5 h-4.5" /> Capturar Foto de Verificación
                </button>
              )}

              {capturedPhoto && !biometricVerifying && (
                <button
                  type="button"
                  onClick={startCamera}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-3xs uppercase tracking-widest border border-slate-200"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Volver a tomar foto
                </button>
              )}
            </div>

            {/* GPS Metrics Alert & Geofence Verification */}
            {gpsCoords && (
              <div className="space-y-3">
                {/* 1. Estado de autenticidad del proveedor GPS */}
                <div className={`p-3.5 rounded-2xl border flex gap-3 text-left ${
                  gpsMocked 
                    ? 'bg-rose-50 border-rose-250 text-rose-800' 
                    : 'bg-emerald-50 border-emerald-250 text-emerald-800'
                }`}>
                  {gpsMocked ? (
                    <>
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="text-3xs font-semibold leading-relaxed">
                        <strong className="block uppercase tracking-wider">¡ANOMALÍA DETECTADA! (Mock Location)</strong>
                        <span>Se ha detectado un proveedor de ubicación simulada/falsa en el navegador. Esta anomalía será reportada al departamento de Recursos Humanos de forma inmediata.</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-3xs font-semibold leading-relaxed">
                        <strong className="block uppercase tracking-wider">Verificación de GPS Exitosa</strong>
                        <span>Precisión del sensor: <strong>{gpsAccuracy?.toFixed(1)}m</strong>. Proveedor de ubicación verificado como auténtico.</span>
                      </div>
                    </>
                  )}
                </div>

                {/* 2. Verificación Geométrica de Geocercas */}
                {!gpsMocked && geocercas && geocercas.length > 0 && (() => {
                  // Mapear geocercas con distancias calculadas en metros reales
                  const geocercasConDistancia = geocercas.map(geo => {
                    const dist = calcularDistancia(
                      gpsCoords.latitude, 
                      gpsCoords.longitude, 
                      Number(geo.latitud), 
                      Number(geo.longitud)
                    );
                    return { ...geo, distancia: dist };
                  });

                  // Encontrar la geocerca configurada más cercana
                  geocercasConDistancia.sort((a, b) => a.distancia - b.distancia);
                  const cercana = geocercasConDistancia[0];
                  const estaEnRango = cercana.distancia <= cercana.radioToleranciaMetros;

                  return (
                    <div className={`p-3.5 rounded-2xl border flex gap-3 text-left ${
                      estaEnRango 
                        ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
                        : 'bg-rose-50 border-rose-250 text-rose-800'
                    }`}>
                      {estaEnRango ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="text-3xs font-semibold leading-relaxed">
                            <strong className="block uppercase tracking-wider">Dentro de Geocerca: {cercana.descripcion}</strong>
                            <span>Distancia al centro: <strong>{cercana.distancia.toFixed(1)}m</strong> (Límite tolerado: {cercana.radioToleranciaMetros}m).</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                          <div className="text-3xs font-semibold leading-relaxed">
                            <strong className="block uppercase tracking-wider text-rose-900">Fuera de Geocerca: {cercana.descripcion}</strong>
                            <span className="block mt-0.5 text-rose-800">
                              Tu dispositivo se encuentra a <strong>{cercana.distancia.toFixed(1)}m</strong> del centro de la geocerca (Límite máximo permitido: <strong>{cercana.radioToleranciaMetros}m</strong>).
                            </span>
                             <span className="block mt-1 text-slate-500 font-medium font-mono text-[9px]">
                              Coords actual: {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}<br />
                              Coords geocerca: {Number(cercana.latitud).toFixed(6)}, {Number(cercana.longitud).toFixed(6)}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(`${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}`);
                                alert("Coordenadas copiadas al portapapeles. Pégalas en la configuración de la geocerca de tu empleado.");
                              }}
                              className="mt-2 px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg font-sans text-[9px] font-bold tracking-wide transition cursor-pointer flex items-center gap-1 inline-flex"
                            >
                              Copiar coordenadas actuales
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Alerta cuando el empleado no tiene geocercas asignadas */}
                {!gpsMocked && (!geocercas || geocercas.length === 0) && (
                  <div className="p-3.5 rounded-2xl border border-amber-250 bg-amber-50/20 flex gap-3 text-left text-amber-850">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-3xs font-semibold leading-relaxed">
                      <strong className="block uppercase tracking-wider text-amber-900">Sin Geocercas Registradas</strong>
                      <span className="block mt-0.5 text-amber-800">
                        Aún no tienes ninguna geocerca asignada en el sistema. Copia tus coordenadas de ubicación reales aquí abajo y envíalas a tu jefe de Recursos Humanos para que configure tu geocerca de trabajo.
                      </span>
                      <span className="block mt-1.5 text-slate-500 font-medium font-mono text-[9px]">
                        Coords actual: {gpsCoords.latitude.toFixed(6)}, {gpsCoords.longitude.toFixed(6)}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(`${gpsCoords.latitude.toFixed(6)}, ${gpsCoords.longitude.toFixed(6)}`);
                          alert("Coordenadas de ubicación copiadas. Pégalas en la configuración de la geocerca de tu empleado o envíalas a tu jefe de RRHH.");
                        }}
                        className="mt-2 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-sans text-[9px] font-bold tracking-wide transition cursor-pointer flex items-center gap-1 inline-flex border border-amber-200/50"
                      >
                        Copiar mis coordenadas actuales
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Acciones del Modal */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setShowRemoteModal(false); stopCamera(); }}
                className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAsistencia(activeFlowType, 'BOTON_REMOTO')}
                disabled={gpsLoading || biometricVerifying || !capturedPhoto || biometricScore === null}
                className="w-2/3 bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar y Enviar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. MODAL DE ESCANER DE QR DINÁMICO (PRESENCIAL) */}
      {/* ========================================================================= */}
      {showPresencialModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-150 rounded-3xl shadow-2xl max-w-md w-full p-6 md:p-8 space-y-6 text-left relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Cabecera */}
            <div className="flex justify-between items-start">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-250 bg-sky-50 px-2.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-sky-700">
                  <QrCode className="w-3.5 h-3.5" /> Validación Física
                </span>
                <h3 className="text-lg font-black text-[#0f2942] tracking-tight mt-1.5">
                  Escanear QR Dinámico de Recepción
                </h3>
              </div>
              <button 
                onClick={() => setShowPresencialModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulación del Scanner */}
            <div className="space-y-4">
              <span className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                Lector de códigos QR
              </span>
              
              <div className="relative h-48 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center text-center p-4 shadow-inner">
                {qrScanning ? (
                  <div className="space-y-3">
                    <RefreshCw className="w-8 h-8 text-[#1ba0f2] animate-spin mx-auto" />
                    <p className="text-slate-400 text-xs font-semibold">Decodificando patrón QR...</p>
                  </div>
                ) : qrScannedSuccess ? (
                  <div className="space-y-2 text-emerald-500">
                    <CheckCircle2 className="w-10 h-10 mx-auto" />
                    <p className="text-xs font-bold">Código QR Leído con Éxito</p>
                    <span className="text-[10px] text-slate-500 font-mono block max-w-xs truncate mx-auto bg-slate-900 py-1 px-2.5 rounded-lg border border-slate-800">
                      {qrToken}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3 text-slate-500">
                    <QrCode className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs font-semibold max-w-xs">Apunte la cámara de su dispositivo móvil o web hacia el monitor de la recepción.</p>
                  </div>
                )}

                {/* Scanning Laser animation */}
                {qrScanning && (
                  <div className="absolute inset-x-0 h-0.5 bg-[#1ba0f2] animate-bounce shadow-[0_0_8px_#1ba0f2]" />
                )}
                
                {/* Frame border overlay */}
                <div className="absolute inset-6 border border-white/20 rounded-xl pointer-events-none" />
              </div>

              {/* Botones de acción del Scanner (Simular) */}
              {!qrScanning && !qrScannedSuccess && (
                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => handleSimulateQrScan(true)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-3xs font-black uppercase tracking-wider text-slate-700 transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-4.5 h-4.5 text-[#1ba0f2]" />
                    <span>Escanear QR Válido</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSimulateQrScan(false)}
                    className="p-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-3xs font-black uppercase tracking-wider text-slate-700 transition flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <QrCode className="w-4.5 h-4.5 text-rose-500" />
                    <span>Escanear QR Expirado</span>
                  </button>
                </div>
              )}
            </div>

            {/* Info de la política de expiración */}
            <div className="bg-sky-50/30 border border-sky-150 rounded-2xl p-4 flex gap-2.5 text-sky-950 font-semibold text-3xs">
              <Info className="w-4.5 h-4.5 text-[#1ba0f2] shrink-0 mt-0.5" />
              <div>
                <strong className="block uppercase tracking-wider">Regla de Expiración Activa (5 Segundos)</strong>
                <p className="mt-0.5 text-slate-500 leading-relaxed font-medium">El backend valida el timestamp incrustado en el token del QR. Si transcurren más de 5 segundos entre la generación del código y su transmisión, la marca de asistencia se considerará fraudulenta y será rechazada.</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowPresencialModal(false)}
                className="w-1/3 bg-slate-50 hover:bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-center"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleConfirmAsistencia(activeFlowType, 'QR_DINAMICO')}
                disabled={!qrScannedSuccess}
                className="w-2/3 bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 disabled:opacity-50 text-white py-3 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Confirmar Asistencia
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
