import { useEffect, useState } from 'react';
import { ShieldAlert, Terminal, X, Lock } from 'lucide-react';

export default function AntiTamperGuard({ children }) {
  const [tamperDetected, setTamperDetected] = useState(false);
  const [tamperReason, setTamperReason] = useState('');
  const [bypass, setBypass] = useState(() => {
    return sessionStorage.getItem('clara_security_tamper_bypass') === 'true';
  });

  useEffect(() => {
    if (bypass) return;

    // --- 1. BLOQUEO DE MENÚ CONTEXTUAL (CLICK DERECHO) ---
    const handleContextMenu = (e) => {
      e.preventDefault();
      alertSecurityViolation('Click derecho deshabilitado por directivas de seguridad.');
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // --- 2. BLOQUEO DE TECLAS DE INSPECCIÓN (F12, CTRL+SHIFT+I, ETC) ---
    const handleKeyDown = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        alertSecurityViolation('F12 (Herramientas de Desarrollador) bloqueado.');
        return false;
      }
      
      // Ctrl + Shift + I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        alertSecurityViolation('Inspección de código (Ctrl+Shift+I) bloqueada.');
        return false;
      }

      // Ctrl + Shift + J (Consola)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        alertSecurityViolation('Consola de desarrollador (Ctrl+Shift+J) bloqueada.');
        return false;
      }

      // Ctrl + Shift + C (Selector de Elementos)
      if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        alertSecurityViolation('Selector de elementos (Ctrl+Shift+C) bloqueado.');
        return false;
      }

      // Ctrl + U (Ver código fuente)
      if (e.ctrlKey && e.keyCode === 85) {
        e.preventDefault();
        alertSecurityViolation('Ver código fuente (Ctrl+U) bloqueado.');
        return false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // --- 3. BUCLE DE INTERRUPCIÓN DEL DEPURADOR (ANTI-DEBUGGING LOOP) ---
    // Si abren la consola, la instrucción 'debugger' pausará el script indefinidamente.
    const antiDebugInterval = setInterval(() => {
      const startTime = Date.now();
      
      // La palabra clave debugger detiene la ejecución si las herramientas de desarrollador están abiertas
      (function() {
        return function() {
          debugger;
        }.constructor('debugger')();
      })();

      const endTime = Date.now();
      // Si el tiempo de paso es mayor a 100ms, significa que el debugger interrumpió el hilo
      if (endTime - startTime > 100) {
        setTamperDetected(true);
        setTamperReason('Acceso no autorizado mediante herramientas de depuración activa (Debugger).');
      }
    }, 1000);

    // --- 4. DETECCIÓN POR TAMAÑO DE VENTANA (DEVTOOLS ACOPLADAS) ---
    const checkDevToolsDimensions = () => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      
      if (widthDiff || heightDiff) {
        setTamperDetected(true);
        setTamperReason('Herramientas de Desarrollador acopladas en la ventana actual.');
      }
    };
    
    const dimensionInterval = setInterval(checkDevToolsDimensions, 2000);
    window.addEventListener('resize', checkDevToolsDimensions);

    // Limpieza de eventos
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(antiDebugInterval);
      clearInterval(dimensionInterval);
      window.removeEventListener('resize', checkDevToolsDimensions);
    };
  }, [bypass]);

  const alertSecurityViolation = (msg) => {
    console.warn(`%c[Clara Security] Violación: ${msg}`, 'color: red; font-size: 14px; font-weight: bold;');
    // Mostrar feedback en consola para despistar
    console.clear();
    console.log(
      '%c¡ACCESO RESTRINGIDO!', 
      'color: red; font-size: 28px; font-weight: 800; text-shadow: 0 0 10px rgba(255,0,0,0.5);'
    );
    console.log(
      '%cEste portal se encuentra protegido contra ingeniería inversa y manipulación en caliente.', 
      'color: white; background: #0f2942; font-size: 11px; padding: 6px; border-radius: 4px;'
    );
  };

  const handleDevBypass = () => {
    sessionStorage.setItem('clara_security_tamper_bypass', 'true');
    setBypass(true);
    setTamperDetected(false);
  };

  if (tamperDetected && !bypass) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-6 relative overflow-hidden font-sans text-left">
        {/* Background glow */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-600/5 rounded-full blur-3xl -z-10" />
        
        {/* Header */}
        <header className="max-w-7xl w-full mx-auto flex items-center justify-between py-4 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img 
              src="/logo_clara.png" 
              alt="Clara Logo" 
              className="h-12 w-auto object-contain bg-white/10 rounded-xl p-1"
            />
            <span className="text-[9px] bg-[#1ba0f2] text-white px-2 py-0.5 rounded font-black uppercase tracking-wider">
              Seguridad Clara
            </span>
          </div>
        </header>

        {/* Content Lock Screen */}
        <main className="max-w-lg w-full mx-auto flex-grow flex flex-col items-center justify-center text-center gap-6 py-10">
          <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 animate-bounce">
            <Lock className="h-7 w-7" />
          </div>
          
          <div className="space-y-2">
            <span className="text-[9px] bg-rose-500/20 text-rose-400 border border-rose-500/35 px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest inline-block">
              Violación de Seguridad Detectada
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight leading-tight pt-1">
              Consola del Navegador Bloqueada
            </h2>
            <p className="text-xs text-slate-450 leading-relaxed font-semibold">
              El sistema de seguridad de Clara ha desactivado temporalmente la interfaz de autogestión. Se ha detectado la apertura de herramientas de inspección, depuración activa o manipulación del DOM en esta pestaña.
            </p>
          </div>

          {/* Technical reasons */}
          <div className="w-full bg-slate-900/60 border border-slate-900 rounded-2xl p-4.5 text-left text-3xs font-semibold space-y-2.5 text-slate-400">
            <div className="flex justify-between border-b border-slate-800/60 pb-2">
              <span>Motivo del Bloqueo:</span>
              <span className="text-rose-450 font-bold uppercase">{tamperReason}</span>
            </div>
            <p className="leading-relaxed text-[10px] text-slate-500 font-medium">
              Para desbloquear la sesión, por favor cierra la consola del desarrollador (DevTools), recarga la pestaña e ingresa desde un dispositivo móvil autorizado.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 rounded-xl text-xs font-bold transition uppercase tracking-wider cursor-pointer"
          >
            Recargar Pestaña
          </button>
        </main>

        {/* Footer with Dev bypass */}
        <footer className="max-w-7xl w-full mx-auto flex justify-between items-center py-4 border-t border-white/5 flex-shrink-0 text-slate-500 text-5xs font-bold uppercase tracking-widest">
          <span>Clara Security &copy; 2026</span>
          <button
            onClick={handleDevBypass}
            className="flex items-center gap-1 text-slate-600 hover:text-rose-500 transition duration-150 cursor-pointer"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Omitir Bloqueo en Desarrollo</span>
          </button>
        </footer>
      </div>
    );
  }

  return (
    <>
      {bypass && (
        <div className="bg-rose-600 text-white px-4 py-1.5 text-center text-4xs font-black uppercase tracking-widest flex items-center justify-center gap-1.5 sticky top-8 z-50 shadow-sm border-b border-rose-700 print:hidden animate-pulse">
          <Terminal className="h-3.5 w-3.5 text-yellow-350" />
          <span>Advertencia: Protección Anti-Tamper Desactivada en Desarrollo</span>
          <button 
            onClick={() => {
              sessionStorage.removeItem('clara_security_tamper_bypass');
              setBypass(false);
              setTamperDetected(false);
            }}
            className="ml-4 px-2 py-0.5 bg-slate-950 text-white rounded hover:bg-slate-800 transition"
          >
            Reactivar Anti-Tamper
          </button>
        </div>
      )}
      {children}
    </>
  );
}
