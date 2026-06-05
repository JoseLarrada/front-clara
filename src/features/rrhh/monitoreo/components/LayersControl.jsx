import { Maximize, Layers } from 'lucide-react';

export default function LayersControl({
  setTriggerFitBounds,
  showGeofencesLayer,
  setShowGeofencesLayer,
  showLabelsLayer,
  setShowLabelsLayer,
  showRoutesLayer,
  setShowRoutesLayer
}) {
  return (
    <div className="absolute top-4 left-16 z-20 flex gap-2">
      <button
        type="button"
        onClick={() => setTriggerFitBounds(true)}
        className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-white border border-slate-800 rounded-xl shadow-lg transition flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
        title="Encuadrar todos los colaboradores en el mapa"
      >
        <Maximize className="h-3.5 w-3.5 text-[#1ba0f2]" />
        <span>Encuadrar Todo</span>
      </button>

      <div className="relative group">
        <button
          type="button"
          className="px-3 py-2 bg-slate-900/90 hover:bg-slate-850 text-white border border-slate-800 rounded-xl shadow-lg transition flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider cursor-pointer"
        >
          <Layers className="h-3.5 w-3.5 text-[#1ba0f2]" />
          <span>Capas</span>
        </button>

        <div className="absolute left-0 mt-2 bg-slate-900/95 border border-slate-800 rounded-2xl p-3 shadow-2xl text-left space-y-2.5 w-48 hidden group-hover:block hover:block transition-all duration-200">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 block border-b border-slate-800 pb-1">
            Visualización del Mapa
          </span>
          
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showGeofencesLayer}
              onChange={(e) => setShowGeofencesLayer(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-[#1ba0f2] focus:ring-[#1ba0f2] cursor-pointer"
            />
            <span>Ver Geocercas</span>
          </label>

          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showLabelsLayer}
              onChange={(e) => setShowLabelsLayer(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-[#1ba0f2] focus:ring-[#1ba0f2] cursor-pointer"
            />
            <span>Ver Nombres (Labels)</span>
          </label>

          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-300 hover:text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showRoutesLayer}
              onChange={(e) => setShowRoutesLayer(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-[#1ba0f2] focus:ring-[#1ba0f2] cursor-pointer"
            />
            <span>Ver Trayectorias</span>
          </label>
        </div>
      </div>
    </div>
  );
}
