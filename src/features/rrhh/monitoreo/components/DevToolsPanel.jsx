import { Settings, Flame, Activity } from 'lucide-react';

export default function DevToolsPanel({
  showDevTools,
  setShowDevTools,
  simulateAnomalyEvent
}) {
  return (
    <div className="absolute top-4 right-4 z-20 print:hidden text-right">
      <button
        onClick={() => setShowDevTools(!showDevTools)}
        className="p-2.5 bg-slate-900/90 hover:bg-slate-850 text-amber-500 border border-slate-800 rounded-full shadow-lg hover:shadow-amber-500/10 transition flex items-center gap-1 text-[10px] font-black uppercase tracking-wider cursor-pointer border-0"
        title="Opciones de Desarrollador / Simulación"
      >
        <Settings className={`h-4 w-4 ${showDevTools ? 'animate-spin' : ''}`} />
      </button>

      {showDevTools && (
        <div className="mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl text-left space-y-2.5 w-64 animate-in slide-in-from-top-3 duration-250">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block border-b border-slate-800 pb-1">
            Simulador de Anomalías (Local)
          </span>

          <button
            onClick={() => simulateAnomalyEvent('FUERA_DE_GEOCERCA')}
            className="w-full text-left p-2 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 text-3xs font-extrabold uppercase text-rose-400 cursor-pointer border-0 bg-transparent"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Inyectar Fuera de Geocerca</span>
          </button>

          <button
            onClick={() => simulateAnomalyEvent('FACE_MISMATCH')}
            className="w-full text-left p-2 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 text-3xs font-extrabold uppercase text-rose-450 cursor-pointer border-0 bg-transparent"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Inyectar Rostro No Coincide</span>
          </button>

          <button
            onClick={() => simulateAnomalyEvent('MOCK_LOCATION_DETECTADA')}
            className="w-full text-left p-2 hover:bg-slate-800 rounded-xl transition flex items-center gap-2 text-3xs font-extrabold uppercase text-rose-450 cursor-pointer border-0 bg-transparent"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Inyectar GPS Simulado</span>
          </button>
        </div>
      )}
    </div>
  );
}
