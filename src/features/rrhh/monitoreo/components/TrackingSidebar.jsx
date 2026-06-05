import { 
  Signal, 
  ShieldCheck, 
  ShieldAlert, 
  TriangleAlert, 
  Play, 
  Pause, 
  AlertCircle,
  X 
} from 'lucide-react';

function getGpsQuality(precisionGps) {
  if (precisionGps == null) return { label: 'N/A', color: 'text-slate-500', dot: 'bg-slate-500' };
  const val = Number(precisionGps);
  if (val <= 20) return { label: 'Excelente', color: 'text-emerald-400', dot: 'bg-emerald-500' };
  if (val <= 50) return { label: 'Buena', color: 'text-amber-400', dot: 'bg-amber-500' };
  return { label: 'Débil', color: 'text-rose-400', dot: 'bg-rose-500' };
}

const getTipoAnomaliaLabel = (type) => {
  switch (type) {
    case 'MOCK_LOCATION_DETECTADA': return 'GPS Falso / Simulado';
    case 'FACE_MISMATCH': return 'Rostro No Coincide';
    case 'FUERA_DE_GEOCERCA': return 'Fuera de Perímetro';
    default: return type;
  }
};

export default function TrackingSidebar({
  employees,
  filteredEmployees,
  selectedEmployee,
  sidebarTab,
  setSidebarTab,
  employeeSearch,
  setEmployeeSearch,
  activeAnomalies,
  historyEmployeeId,
  setHistoryEmployeeId,
  filterDate,
  setFilterDate,
  routeHistory,
  filteredHistory,
  playbackIndex,
  setPlaybackIndex,
  isPlayingRoute,
  togglePlayback,
  playbackSpeed,
  setPlaybackSpeed,
  historySearch,
  setHistorySearch,
  historyFilterType,
  setHistoryFilterType,
  historyError,
  handleSelectEmployee,
  setAuditAnomaly,
  setAnomalyToResolve,
  setIsResolutionOpen,
  setMapCenter,
  setRouteHistory,
  setPlaybackIndexState,
  setIsPlayingRouteState
}) {
  return (
    <aside className="w-full md:w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Cabecera Pestañas */}
      <div className="flex border-b border-slate-800 text-3xs font-extrabold uppercase tracking-widest text-slate-400 shrink-0">
        <button 
          onClick={() => setSidebarTab('employees')}
          className={`flex-1 py-3.5 border-b-2 text-center transition cursor-pointer ${sidebarTab === 'employees' ? 'border-[#1ba0f2] text-white bg-slate-950/20' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          Personal ({employees.length})
        </button>
        <button 
          onClick={() => setSidebarTab('alerts')}
          className={`flex-1 py-3.5 border-b-2 text-center transition cursor-pointer flex items-center justify-center gap-1 ${sidebarTab === 'alerts' ? 'border-rose-500 text-rose-450 bg-slate-950/20' : 'border-transparent text-slate-500 hover:text-rose-500/70'}`}
        >
          Alertas ({activeAnomalies.length})
          {activeAnomalies.length > 0 && (
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
        <button 
          onClick={() => {
            setSidebarTab('history');
            if (selectedEmployee && !historyEmployeeId) {
              setHistoryEmployeeId(selectedEmployee.empleadoId);
            }
          }}
          className={`flex-1 py-3.5 border-b-2 text-center transition cursor-pointer ${sidebarTab === 'history' ? 'border-[#1ba0f2] text-white bg-slate-950/20' : 'border-transparent text-slate-500 hover:text-slate-350'}`}
        >
          Historial
        </button>
      </div>

      {/* Contenido Pestaña 1: Empleados */}
      {sidebarTab === 'employees' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Buscador de Colaboradores en Vivo */}
          <div className="p-3 border-b border-slate-800/60 bg-slate-900/40 shrink-0">
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-3xs text-white placeholder-slate-700 focus:outline-none focus:border-[#1ba0f2] transition"
            />
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
            {filteredEmployees.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">
                {employeeSearch ? 'Sin resultados para la búsqueda.' : 'Cargando información de personal...'}
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected = selectedEmployee?.empleadoId === emp.empleadoId;
                const tienePos = emp.latitud && emp.longitud;
                const fuera = emp.fueraDeGeocerca === true;
                const gps = getGpsQuality(emp.precisionGps);

                let stateColor = 'bg-slate-500';
                if (emp.anomaliasHoy > 0 || emp.ultimaAnomalia) stateColor = 'bg-rose-600 border border-yellow-350';
                else if (fuera) stateColor = 'bg-rose-500';
                else if (emp.estadoConexion === 'ACTIVO') stateColor = 'bg-emerald-500';
                else if (emp.estadoConexion === 'INACTIVO') stateColor = 'bg-amber-500';

                let shiftText = 'No Iniciado';
                let shiftStyle = 'bg-slate-950 text-slate-400 border-slate-800';
                if (emp.jornadaEstado === 'EN_JORNADA') {
                  shiftText = 'En Jornada';
                  shiftStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                } else if (emp.jornadaEstado === 'ALMUERZO') {
                  shiftText = 'Almuerzo';
                  shiftStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                } else if (emp.jornadaEstado === 'FINALIZADA') {
                  shiftText = 'Finalizado';
                  shiftStyle = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                }

                return (
                  <button
                    key={emp.empleadoId}
                    onClick={() => handleSelectEmployee(emp)}
                    className={`w-full text-left p-3.5 transition-all hover:bg-slate-800/20 flex flex-col gap-2 ${isSelected ? 'bg-slate-800/60 border-l-4 border-[#1ba0f2]' : ''} ${(emp.anomaliasHoy > 0) ? 'bg-rose-950/10' : ''}`}
                  >
                    <div className="flex justify-between items-start w-full gap-2">
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-semibold text-sm text-white truncate max-w-[150px]">
                          {emp.empleadoNombre}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                          {emp.email}
                        </span>
                      </div>
                      <span className="text-[9px] font-bold bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                        {emp.modalidad || 'REMOTO'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full gap-2">
                      <span className={`text-[10px] font-semibold border px-2 py-0.5 rounded-md ${shiftStyle}`}>
                        {shiftText}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${stateColor} ${emp.estadoConexion === 'ACTIVO' && !fuera ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {emp.estadoConexion}
                        </span>
                      </div>
                    </div>

                    {/* Alerta de Perímetro */}
                    {fuera && (
                      <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/30 px-2 py-1 rounded-lg w-full">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-[10px] font-bold text-rose-400">FUERA DE PERÍMETRO</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between w-full gap-1 text-[10px] text-slate-450">
                      <span className="truncate max-w-[100px] font-mono">
                        {tienePos ? `${Number(emp.latitud).toFixed(4)}, ${Number(emp.longitud).toFixed(4)}` : 'Sin GPS'}
                      </span>

                      <div className="flex items-center gap-2">
                        {tienePos && (
                          <div className="flex items-center gap-1" title={`Precisión GPS: ${emp.precisionGps || 'N/A'}m`}>
                            <Signal className="w-3 h-3" />
                            <span className={`w-1.5 h-1.5 rounded-full ${gps.dot}`} />
                          </div>
                        )}

                        {(emp.anomaliasHoy || 0) > 0 && (
                          <div className="flex items-center gap-0.5 bg-rose-600/30 border border-rose-500/20 px-1.5 py-0.5 rounded-full text-rose-400 font-bold" title={`${emp.anomaliasHoy} anomalía(s)`}>
                            <TriangleAlert className="w-2.5 h-2.5" />
                            <span>{emp.anomaliasHoy}</span>
                          </div>
                        )}

                        {emp.ultimaActualizacion && (
                          <span className="text-[9px]">
                            {new Date(emp.ultimaActualizacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Contenido Pestaña 2: Alertas de Seguridad Recibidas */}
      {sidebarTab === 'alerts' && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {activeAnomalies.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-semibold uppercase tracking-wider space-y-1.5">
              <ShieldCheck className="h-6 w-6 text-emerald-500 mx-auto" />
              <p>No hay alertas reportadas hoy</p>
            </div>
          ) : (
            activeAnomalies.map((anom) => (
              <div 
                key={anom.id}
                className="p-3.5 text-left border-l-4 border-rose-600 bg-rose-500/5 space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="font-black text-rose-400 text-[9px] uppercase tracking-wider">
                    {getTipoAnomaliaLabel(anom.tipoAnomalia)}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    {new Date(anom.creadoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-extrabold text-white">{anom.empleadoNombre}</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed truncate">{anom.detallesTecnicos}</p>
                
                <div className="flex gap-2 pt-1 uppercase tracking-widest text-[8px] font-bold">
                  <button
                    onClick={() => {
                      const emp = employees.find(e => e.empleadoId === anom.empleadoId);
                      if (emp) handleSelectEmployee(emp);
                      setAuditAnomaly(anom);
                    }}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md transition cursor-pointer"
                  >
                    Auditar
                  </button>
                  <button
                    onClick={() => {
                      setAnomalyToResolve(anom);
                      setIsResolutionOpen(true);
                    }}
                    className="px-2 py-1 bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-500/30 text-emerald-350 rounded-md transition cursor-pointer"
                  >
                    Resolver
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Contenido Pestaña 3: Historial y Filtros */}
      {sidebarTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-semibold text-slate-355">
          {/* Selector de Empleado */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Colaborador</label>
            <select
              value={historyEmployeeId}
              onChange={(e) => {
                setHistoryEmployeeId(e.target.value);
                const emp = employees.find(emp => emp.empleadoId === e.target.value);
                if (emp) {
                  handleSelectEmployee(emp);
                } else {
                  setRouteHistory([]);
                }
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 px-3 text-xs font-bold text-white focus:border-[#1ba0f2] focus:outline-none transition cursor-pointer"
            >
              <option value="">Seleccione un colaborador...</option>
              {employees.map(emp => (
                <option key={emp.empleadoId} value={emp.empleadoId}>
                  {emp.empleadoNombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro de Fecha Local */}
          {historyEmployeeId && (
            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Filtrar por Fecha</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none [color-scheme:dark] cursor-pointer"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-[10px] text-[#1ba0f2] hover:underline cursor-pointer block mt-1"
                >
                  Ver historial completo (sin fecha)
                </button>
              )}
            </div>
          )}

          {/* Reproductor Trace Player y Filtros (Sólo si hay historial cargado) */}
          {routeHistory.length > 0 && (
            <div className="space-y-4 pt-3 border-t border-slate-800">
              {/* Reproductor Flotante Mini */}
              {filteredHistory.length > 0 && (
                <div className="bg-slate-950 border border-slate-855 rounded-xl p-3 space-y-2 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Reproductor de Ruta</span>
                    {filterDate && (
                      <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {filterDate}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={togglePlayback}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[#1ba0f2] hover:text-white transition cursor-pointer"
                        title={isPlayingRoute ? "Pausar" : "Reproducir"}
                      >
                        {isPlayingRoute ? <Pause className="h-3.5 w-3.5 fill-[#1ba0f2]" /> : <Play className="h-3.5 w-3.5 fill-[#1ba0f2]" />}
                      </button>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-855 rounded-xl px-2 py-1 text-3xs font-black uppercase text-[#1ba0f2] focus:outline-none cursor-pointer"
                      >
                        <option value="1">1x</option>
                        <option value="2">2x</option>
                        <option value="5">5x</option>
                      </select>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {playbackIndex + 1}/{filteredHistory.length}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#1ba0f2] h-full rounded-full transition-all duration-300"
                      style={{ width: `${((playbackIndex + 1) / Math.max(1, filteredHistory.length)) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Filtros de Logs */}
              <div className="space-y-2 text-left">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Filtrar Logs de Ubicación</span>
                <input
                  type="text"
                  placeholder="Buscar por hora o coords..."
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-855 rounded-xl px-3 py-2 text-3xs text-white placeholder-slate-700 focus:outline-none"
                />
                
                {/* Botones de Filtro Rápido */}
                <div className="flex gap-1 text-[9px] font-black uppercase tracking-wider">
                  <button
                    type="button"
                    onClick={() => setHistoryFilterType('ALL')}
                    className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${historyFilterType === 'ALL' ? 'border-[#1ba0f2] text-white bg-[#1ba0f2]/10' : 'border-slate-800 text-slate-500 hover:text-slate-350'}`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilterType('OUT_OF_GEOFENCE')}
                    className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${historyFilterType === 'OUT_OF_GEOFENCE' ? 'border-rose-500 text-rose-455 bg-rose-500/10' : 'border-slate-800 text-slate-500 hover:text-rose-500/70'}`}
                  >
                    Fuera
                  </button>
                  <button
                    type="button"
                    onClick={() => setHistoryFilterType('MOCK_LOCATION')}
                    className={`flex-1 py-1.5 rounded-lg border text-center transition cursor-pointer ${historyFilterType === 'MOCK_LOCATION' ? 'border-amber-500 text-amber-400 bg-amber-50/10' : 'border-slate-800 text-slate-500 hover:text-amber-500/70'}`}
                  >
                    Simulado
                  </button>
                </div>
              </div>

              {/* Listado de Logs Detallado */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-555 uppercase tracking-widest">
                  <span>Logs Filtrados ({filteredHistory.length})</span>
                  <button 
                    onClick={() => {
                      setRouteHistory([]);
                      setPlaybackIndex(0);
                      setFilterDate('');
                      setHistoryEmployeeId('');
                    }}
                    className="text-rose-500 hover:underline cursor-pointer bg-transparent border-0 p-0"
                  >
                    Limpiar
                  </button>
                </div>

                <div className="divide-y divide-slate-850 border border-slate-850 rounded-xl overflow-hidden max-h-[200px] overflow-y-auto bg-slate-950/40">
                  {filteredHistory.length === 0 ? (
                    <div className="p-4 text-center text-slate-650 text-3xs uppercase font-bold">
                      Sin coincidencias.
                    </div>
                  ) : (
                    filteredHistory.map((item, idx) => {
                      const isCurrentPlayback = playbackIndex === filteredHistory.indexOf(item);
                      const itemTime = item.registradoEn ? new Date(item.registradoEn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `Punto ${filteredHistory.indexOf(item) + 1}`;
                      const itemDate = item.registradoEn ? new Date(item.registradoEn).toLocaleDateString([], { month: '2-digit', day: '2-digit' }) : '';
                      const isOutOfGeofence = item.fueraDeGeocerca === true;
                      const isMock = item.esMockLocation === true;

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setPlaybackIndex(filteredHistory.indexOf(item));
                            const lat = Number(item.latitud);
                            const lng = Number(item.longitud);
                            if (!isNaN(lat) && !isNaN(lng)) {
                              setMapCenter([lat, lng]);
                            }
                          }}
                          className={`p-2 text-left text-3xs transition cursor-pointer flex justify-between items-center gap-2 hover:bg-slate-800/20 ${isCurrentPlayback ? 'bg-slate-800/40 border-l-2 border-[#1ba0f2]' : ''}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-white font-bold">{itemTime}</span>
                              {itemDate && <span className="text-[9px] text-slate-450 font-mono">({itemDate})</span>}
                              {isOutOfGeofence ? (
                                <span className="bg-rose-500/10 text-rose-455 border border-rose-500/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">Fuera</span>
                              ) : (
                                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">En Zona</span>
                              )}
                              {isMock && (
                                <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1 py-0.2 rounded font-black text-[8px] uppercase">Simulado</span>
                              )}
                            </div>
                            <span className="font-mono text-slate-500 block truncate max-w-[140px]">
                              {Number(item.latitud).toFixed(5)}, {Number(item.longitud).toFixed(5)}
                            </span>
                          </div>
                          <div className="text-right text-[8px] text-slate-500 space-y-0.5 shrink-0 font-medium">
                            <div>Prec: {item.precisionGps ? `${Number(item.precisionGps).toFixed(0)}m` : 'N/A'}</div>
                            <div>Vel: {item.velocidad != null ? `${(Number(item.velocidad) * 3.6).toFixed(0)}km/h` : 'N/A'}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          )}

          {historyError && (
            <div className="w-full text-rose-455 text-3xs font-extrabold uppercase flex items-center gap-1 bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-xl text-left">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{historyError}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
