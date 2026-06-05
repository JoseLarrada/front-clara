import { X } from 'lucide-react';

export default function ActiveEmployeeOverlay({
  selectedEmployee,
  setSelectedEmployee,
  actionLoadingState,
  handleSelectEmployee,
  handleForceClockout,
  handleReallocateGeofence
}) {
  if (!selectedEmployee) return null;

  return (
    <div className="absolute bottom-4 left-4 z-20 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md max-w-xs text-left text-xs font-semibold text-slate-355">
      <div className="flex justify-between items-start gap-2 mb-2 border-b border-slate-800 pb-2">
        <div className="overflow-hidden">
          <h4 className="text-white text-sm font-extrabold truncate">
            {selectedEmployee.empleadoNombre}
          </h4>
          <span className="text-[10px] text-slate-500 font-mono truncate block">
            {selectedEmployee.email}
          </span>
        </div>
        <button 
          onClick={() => setSelectedEmployee(null)}
          className="p-1 rounded bg-slate-950/40 text-slate-500 hover:text-white cursor-pointer border-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-1.5 text-[10px] uppercase font-extrabold tracking-wider">
        <div className="flex justify-between">
          <span className="text-slate-500">Conexión:</span>
          <span className={selectedEmployee.estadoConexion === 'ACTIVO' ? 'text-emerald-400' : 'text-slate-500'}>
            {selectedEmployee.estadoConexion}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Perímetro:</span>
          <span className={selectedEmployee.fueraDeGeocerca ? 'text-rose-455' : 'text-emerald-400'}>
            {selectedEmployee.fueraDeGeocerca ? 'Fuera de Geocerca' : 'En Zona'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Modalidad:</span>
          <span className="text-[#1ba0f2]">{selectedEmployee.modalidad || 'REMOTO'}</span>
        </div>
      </div>

      {/* Acciones Administrativas Rápidas */}
      <div className="mt-3.5 flex flex-col gap-2 w-full uppercase tracking-widest text-[9px] font-bold border-t border-slate-800 pt-2.5">
        <button
          onClick={() => handleSelectEmployee(selectedEmployee)}
          className="w-full py-1.5 bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white rounded-lg transition shadow-xs text-center cursor-pointer border-0"
        >
          Ver Historial de Ruta
        </button>
        <div className="flex gap-2">
          {selectedEmployee.jornadaEstado === 'EN_JORNADA' && (
            <button
              onClick={() => handleForceClockout(selectedEmployee.empleadoId)}
              disabled={actionLoadingState}
              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs text-center cursor-pointer disabled:opacity-50 border-0"
            >
              Forzar Salida
            </button>
          )}
          <button
            onClick={() => handleReallocateGeofence(selectedEmployee)}
            disabled={actionLoadingState}
            className="flex-1 py-1.5 bg-purple-650 hover:bg-purple-750 text-white rounded-lg transition shadow-xs text-center cursor-pointer disabled:opacity-50 border-0"
          >
            Mover Geocerca
          </button>
        </div>
      </div>
    </div>
  );
}
