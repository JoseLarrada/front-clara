import {
  Navigation,
  ShieldCheck,
  ShieldAlert,
  TriangleAlert,
  Flame,
  X
} from 'lucide-react';
import RRHHLayout from '../../common/components/RRHHLayout';
import { useTrackingState } from '../hooks/useTrackingState';
import TrackingMap from '../components/TrackingMap';
import TrackingSidebar from '../components/TrackingSidebar';
import LayersControl from '../components/LayersControl';
import ActiveEmployeeOverlay from '../components/ActiveEmployeeOverlay';
import AuditModal from '../components/AuditModal';
import DevToolsPanel from '../components/DevToolsPanel';
import ResolutionModal from '../components/ResolutionModal';

const getTipoAnomaliaLabel = (type) => {
  switch (type) {
    case 'MOCK_LOCATION_DETECTADA': return 'GPS Falso / Simulado';
    case 'FACE_MISMATCH': return 'Rostro No Coincide';
    case 'FUERA_DE_GEOCERCA': return 'Fuera de Perímetro';
    default: return type;
  }
};

export default function TrackingMapPage() {
  const state = useTrackingState();

  return (
    <RRHHLayout>
      <div className="space-y-6 flex flex-col min-h-[500px] lg:h-[calc(100vh-210px)] text-left relative">

        {/* ===== TOAST CRÍTICO FLOTANTE DE ANOMALÍAS ===== */}
        {state.toastAlert && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-in slide-in-from-top duration-300">
            <div className="bg-rose-600 border border-rose-500 rounded-3xl p-4.5 shadow-2xl flex gap-3 text-white">
              <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center shrink-0 text-white animate-pulse">
                <Flame className="h-5 w-5 fill-white" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex justify-between items-start">
                  <span className="font-black uppercase tracking-widest text-[9px] text-yellow-250">
                    Alerta Crítica: {getTipoAnomaliaLabel(state.toastAlert.tipoAnomalia)}
                  </span>
                  <button
                    onClick={() => state.setToastAlert(null)}
                    className="text-white/75 hover:text-white border-0 bg-transparent cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <h4 className="font-extrabold text-sm mt-0.5">{state.toastAlert.empleadoNombre}</h4>
                <p className="mt-1 text-white/90 font-medium leading-relaxed">{state.toastAlert.detallesTecnicos}</p>
                <button
                  onClick={() => {
                    state.setAuditAnomaly(state.toastAlert);
                    state.setToastAlert(null);
                  }}
                  className="mt-2.5 px-3 py-1 bg-white text-rose-700 font-extrabold text-[9px] uppercase tracking-wider rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer border-0"
                >
                  Abrir Auditoría Biométrica
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== HEADER CON MÉTRICAS GLOBALES ===== */}
        <div className="flex flex-wrap justify-between items-center gap-4 flex-shrink-0">
          <div className="text-left border-l-4 border-[#1ba0f2] pl-4">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-3xs font-extrabold uppercase tracking-wide text-[#1ba0f2]">
              <Navigation className="h-3 w-3" /> Monitoreo de Seguridad
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] sm:text-4xl tracking-tighter leading-none">
              Mapa de Monitoreo GPS
            </h1>
            <p className="mt-2 text-xs text-slate-500 font-semibold leading-none">
              Geofencing, detección de fraude biométrico y cumplimiento en vivo.
            </p>
          </div>

          {/* Contadores globales */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-650 text-xs font-bold">{state.empleadosEnZona.length}</span>
              <span className="text-emerald-650/70 text-[10px]">En zona</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${state.empleadosFuera.length > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-100 border-slate-200'}`}>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span className={`text-xs font-bold ${state.empleadosFuera.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{state.empleadosFuera.length}</span>
              <span className={`text-[10px] ${state.empleadosFuera.length > 0 ? 'text-rose-500/70' : 'text-slate-400'}`}>Fuera de zona</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${state.totalAnomalias > 0 ? 'bg-rose-500/10 border-rose-500/30' : 'bg-slate-100 border-slate-200'}`}>
              <TriangleAlert className="w-4 h-4 text-rose-500 animate-pulse" />
              <span className={`text-xs font-bold ${state.totalAnomalias > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{state.totalAnomalias}</span>
              <span className={`text-[10px] ${state.totalAnomalias > 0 ? 'text-rose-500/70' : 'text-slate-400'}`}>Alertas Graves</span>
            </div>
          </div>
        </div>

        {/* ===== GRID DE MONITOREO (Contenedor Premium Oscuro) ===== */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 text-white shadow-xl">

          {/* Sidebar Izquierdo */}
          <TrackingSidebar
            employees={state.employees}
            filteredEmployees={state.filteredEmployees}
            selectedEmployee={state.selectedEmployee}
            sidebarTab={state.sidebarTab}
            setSidebarTab={state.setSidebarTab}
            employeeSearch={state.employeeSearch}
            setEmployeeSearch={state.setEmployeeSearch}
            activeAnomalies={state.activeAnomalies}
            historyEmployeeId={state.historyEmployeeId}
            setHistoryEmployeeId={state.setHistoryEmployeeId}
            filterDate={state.filterDate}
            setFilterDate={state.setFilterDate}
            routeHistory={state.routeHistory}
            filteredHistory={state.filteredHistory}
            playbackIndex={state.playbackIndex}
            setPlaybackIndex={state.setPlaybackIndex}
            isPlayingRoute={state.isPlayingRoute}
            togglePlayback={state.togglePlayback}
            playbackSpeed={state.playbackSpeed}
            setPlaybackSpeed={state.setPlaybackSpeed}
            historySearch={state.historySearch}
            setHistorySearch={state.setHistorySearch}
            historyFilterType={state.historyFilterType}
            setHistoryFilterType={state.setHistoryFilterType}
            historyError={state.historyError}
            handleSelectEmployee={state.handleSelectEmployee}
            setAuditAnomaly={state.setAuditAnomaly}
            setAnomalyToResolve={state.setAnomalyToResolve}
            setIsResolutionOpen={state.setIsResolutionOpen}
            setMapCenter={state.setMapCenter}
            setRouteHistory={state.setRouteHistory}
          />

          {/* Mapa y Controles */}
          <main className="flex-grow flex flex-col relative min-h-[400px]">

            {/* Control de Capas y Encuadre Flotante */}
            <LayersControl
              setTriggerFitBounds={state.setTriggerFitBounds}
              showGeofencesLayer={state.showGeofencesLayer}
              setShowGeofencesLayer={state.setShowGeofencesLayer}
              showLabelsLayer={state.showLabelsLayer}
              setShowLabelsLayer={state.setShowLabelsLayer}
              showRoutesLayer={state.showRoutesLayer}
              setShowRoutesLayer={state.setShowRoutesLayer}
            />

            {/* Mapa Leaflet */}
            {state.mapReady && (
              <TrackingMap
                selectedEmployee={state.selectedEmployee}
                employees={state.filteredEmployees}
                triggerFitBounds={state.triggerFitBounds}
                setTriggerFitBounds={state.setTriggerFitBounds}
                showGeofencesLayer={state.showGeofencesLayer}
                showLabelsLayer={state.showLabelsLayer}
                showRoutesLayer={state.showRoutesLayer}
                polylineCoords={state.polylineCoords}
                filteredHistory={state.filteredHistory}
                playbackIndex={state.playbackIndex}
                handleSelectEmployee={state.handleSelectEmployee}
                handleForceClockout={state.handleForceClockout}
                handleReallocateGeofence={state.handleReallocateGeofence}
                mapCenter={state.mapCenter}
              />
            )}

            {/* Tarjeta Flotante del Colaborador Seleccionado */}
            <ActiveEmployeeOverlay
              selectedEmployee={state.selectedEmployee}
              setSelectedEmployee={state.setSelectedEmployee}
              actionLoadingState={state.actionLoadingState}
              handleSelectEmployee={state.handleSelectEmployee}
              handleForceClockout={state.handleForceClockout}
              handleReallocateGeofence={state.handleReallocateGeofence}
            />

            {/* DevTools Panel */}
            <DevToolsPanel
              showDevTools={state.showDevTools}
              setShowDevTools={state.setShowDevTools}
              simulateAnomalyEvent={state.simulateAnomalyEvent}
            />
          </main>
        </div>

        {/* ===== MODALES ===== */}
        <AuditModal
          auditAnomaly={state.auditAnomaly}
          setAuditAnomaly={state.setAuditAnomaly}
          employees={state.employees}
        />

        <ResolutionModal
          isOpen={state.isResolutionOpen}
          onClose={() => {
            state.setIsResolutionOpen(false);
            state.setAnomalyToResolve(null);
          }}
          anomaly={state.anomalyToResolve}
          onResolve={state.handleResolveAnomaly}
        />

      </div>
    </RRHHLayout>
  );
}
