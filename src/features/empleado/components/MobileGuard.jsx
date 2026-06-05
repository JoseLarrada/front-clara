import { useState, useEffect } from 'react';
import { QrCode, ShieldAlert, Monitor, Terminal, ArrowRight, Smartphone } from 'lucide-react';

export default function MobileGuard({ children }) {
  const [isMobile, setIsMobile] = useState(true);
  const [bypass, setBypass] = useState(() => {
    return sessionStorage.getItem('clara_dev_mobile_bypass') === 'true';
  });

  const checkIsMobile = () => {
    // 1. User Agent Check
    const userAgentMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // 2. Touch Screen Pointer Check
    const hasTouch = window.matchMedia('(pointer: coarse)').matches;
    
    // 3. Screen Dimension Check (Standard tablets and phones)
    const isSmallScreen = window.innerWidth <= 1024;

    return userAgentMobile || (hasTouch && isSmallScreen) || isSmallScreen;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(checkIsMobile());
    };
    
    handleResize(); // Primera carga
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleBypass = () => {
    sessionStorage.setItem('clara_dev_mobile_bypass', 'true');
    setBypass(true);
  };

  // Si es un dispositivo móvil o se ha forzado el bypass de desarrollo, permitir el paso
  if (isMobile || bypass) {
    return (
      <>
        {bypass && !isMobile && (
          <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-4xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sticky top-0 z-50 shadow-sm border-b border-amber-600 print:hidden animate-pulse">
            <Terminal className="h-3.5 w-3.5" />
            <span>Modo Desarrollo Activo: Visualización de Escritorio Forzada</span>
            <button 
              onClick={() => {
                sessionStorage.removeItem('clara_dev_mobile_bypass');
                setBypass(false);
              }}
              className="ml-4 px-2 py-0.5 bg-slate-950 text-white rounded hover:bg-slate-800 transition"
            >
              Reactivar Bloqueo
            </button>
          </div>
        )}
        {children}
      </>
    );
  }

  // Si es computadora de escritorio, bloquear y mostrar pantalla premium
  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=0f2942`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans text-left selection:bg-[#1ba0f2]/30 selection:text-white">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#1ba0f2]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img 
            src="/logo_clara.png" 
            alt="Clara Logo" 
            className="h-12 w-auto object-contain bg-white/10 rounded-xl p-1"
          />
          <span className="text-[9px] bg-[#1ba0f2] text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
            Portal Colaborador
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-450 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-5xs font-black uppercase tracking-widest">
          <ShieldAlert className="h-3 w-3" />
          <span>Acceso Restringido</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto flex-grow flex flex-col lg:flex-row items-center justify-center gap-12 py-10">
        
        {/* Left column: Smartphone mockup decoration */}
        <div className="hidden md:flex relative shrink-0">
          {/* Outer smartphone container */}
          <div className="w-[260px] h-[520px] rounded-[45px] border-[8px] border-slate-800 bg-slate-900 shadow-2xl relative p-3 overflow-hidden flex flex-col justify-between">
            {/* Speaker & camera sensor bar */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-10 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
            </div>

            {/* Content screen mockup */}
            <div className="flex-grow rounded-[32px] bg-slate-950 border border-slate-850 p-4 flex flex-col justify-between relative overflow-hidden select-none">
              {/* Blur */}
              <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#1ba0f2]/10 rounded-full blur-2xl -z-10 animate-pulse" />
              
              <div className="space-y-4 pt-6 text-center">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto border border-emerald-500/25">
                  <CheckCircle2Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-[8px] uppercase tracking-widest text-[#1ba0f2] font-black">Asistencia Activa</span>
                  <p className="text-white text-xs font-black">Carles Perez</p>
                  <p className="text-slate-500 text-[8px] font-mono">carles.perez@clara.com</p>
                </div>
              </div>

              {/* Simulated Clocking widget */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2 text-center">
                <span className="text-[7px] text-slate-500 uppercase tracking-widest font-bold">Tiempo Trabajado</span>
                <p className="text-xl font-bold font-mono tracking-tight text-emerald-400">08:14:22</p>
                <div className="w-full bg-[#1ba0f2] text-white text-[8px] py-1.5 rounded-lg font-bold uppercase tracking-wider">
                  Jornada Activa
                </div>
              </div>

              {/* Navigation simulated */}
              <div className="flex justify-around border-t border-slate-900 pt-2 text-[7px] font-bold text-slate-500">
                <span>Asistencia</span>
                <span>Contrato</span>
                <span>Perfil</span>
              </div>
            </div>
          </div>

          {/* Overlay glow effect behind phone */}
          <div className="absolute -inset-4 bg-emerald-500/5 rounded-[60px] blur-xl -z-10" />
        </div>

        {/* Right column: Instructions, QR and Lock panel */}
        <div className="flex-1 space-y-6 max-w-lg">
          <div className="space-y-2.5">
            <span className="text-[10px] text-[#1ba0f2] font-black uppercase tracking-widest block">
              POLÍTICA DE CONTROL DE ACCESO
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
              Se requiere un dispositivo móvil para ingresar
            </h2>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Por razones de seguridad operacional, el Portal de Autogestión del Empleado requiere acceso a hardware nativo (sensor GPS de alta precisión y cámara fotográfica frontal) para la validación biométrica facial y el cumplimiento de geocercas obligatorias.
            </p>
          </div>

          {/* Steps and QR Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-slate-900/40 border border-slate-900 rounded-3xl p-5 md:p-6 backdrop-blur-xs">
            {/* Steps (sm:col-span-7) */}
            <div className="sm:col-span-7 space-y-4 flex flex-col justify-center">
              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 text-[#1ba0f2] font-black text-3xs flex items-center justify-center shrink-0">
                  1
                </div>
                <div className="text-3xs font-semibold">
                  <span className="text-slate-200 block">Abre la cámara de tu móvil</span>
                  <span className="text-slate-500 font-medium leading-relaxed">Utiliza la cámara nativa de tu smartphone.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 text-[#1ba0f2] font-black text-3xs flex items-center justify-center shrink-0">
                  2
                </div>
                <div className="text-3xs font-semibold">
                  <span className="text-slate-200 block">Escanea el código QR</span>
                  <span className="text-slate-500 font-medium leading-relaxed">Apunta al código en pantalla para abrir el enlace.</span>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-6 w-6 rounded-full bg-slate-800 text-[#1ba0f2] font-black text-3xs flex items-center justify-center shrink-0">
                  3
                </div>
                <div className="text-3xs font-semibold">
                  <span className="text-slate-200 block">Registra tu asistencia</span>
                  <span className="text-slate-500 font-medium leading-relaxed font-semibold">Inicia sesión y realiza tus marcas con GPS y rostro.</span>
                </div>
              </div>
            </div>

            {/* QR Card (sm:col-span-5) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center bg-white rounded-2xl p-3 shadow-lg shrink-0 w-44 h-44 mx-auto sm:w-auto sm:h-auto">
              <img 
                src={qrUrl} 
                alt="QR Code Clara Portal"
                className="w-32 h-32 md:w-36 md:h-36 object-contain"
                onError={(e) => {
                  // Fallback si no hay internet o falla el API de QR
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-32 h-32 md:w-36 md:h-36 bg-slate-100 rounded-xl flex-col items-center justify-center text-[#0f2942] text-center p-2.5">
                <QrCode className="h-8 w-8 text-rose-500" />
                <span className="text-[8px] font-bold mt-1.5 uppercase leading-none">Usa tu Móvil</span>
              </div>
              <span className="text-[7px] text-[#0f2942] uppercase font-black tracking-widest mt-1.5">
                Escanear Enlace
              </span>
            </div>
          </div>

        </div>
      </main>

      {/* Footer / Dev Bypass */}
      <footer className="max-w-7xl w-full mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-white/5 flex-shrink-0 text-slate-500 text-5xs font-bold uppercase tracking-widest">
        <span>Clara Portal Colaborador &copy; 2026</span>
        <button
          onClick={handleBypass}
          className="flex items-center gap-1 text-slate-600 hover:text-[#1ba0f2] transition duration-150 cursor-pointer"
          title="Forzar vista de escritorio para pruebas"
        >
          <Terminal className="h-3.5 w-3.5 text-slate-600" />
          <span>Continuar en Computadora (Modo Dev)</span>
        </button>
      </footer>

    </div>
  );
}

// Icono inline para evitar importaciones rotas
function CheckCircle2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
