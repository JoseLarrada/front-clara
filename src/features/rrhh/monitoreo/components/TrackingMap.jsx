import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Signal, ShieldAlert, ShieldCheck } from 'lucide-react';

const DEFAULT_CENTER = [4.60971, -74.08175];
const MAP_STYLE = { width: '100%', height: '100%', background: '#0b0f19' };

// Solución para iconos rotos por defecto en Leaflet con bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Obtener iniciales de un nombre completo
function getInitials(name) {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Componente para controlar zoom, transiciones y encuadre del mapa
function MapController({ selectedEmployee, employees, triggerFitBounds, setTriggerFitBounds }) {
  const map = useMap();

  // 1. Zoom suavizado al seleccionar un colaborador
  useEffect(() => {
    if (selectedEmployee) {
      const lat = Number(selectedEmployee.latitud);
      const lng = Number(selectedEmployee.longitud);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        map.flyTo([lat, lng], 17, { animate: true, duration: 1.5 });
      } else if (selectedEmployee.geocercaLatitud && selectedEmployee.geocercaLongitud) {
        map.flyTo([Number(selectedEmployee.geocercaLatitud), Number(selectedEmployee.geocercaLongitud)], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedEmployee, map]);

  // 2. Auto-encuadre inicial de todos los colaboradores activos
  useEffect(() => {
    if (triggerFitBounds && employees && employees.length > 0) {
      const coords = employees
        .map(emp => [Number(emp.latitud), Number(emp.longitud)])
        .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);

      if (coords.length > 0) {
        const bounds = L.latLngBounds(coords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
      }
      setTriggerFitBounds(false);
    }
  }, [triggerFitBounds, employees, map, setTriggerFitBounds]);

  return null;
}

function getGpsQuality(precisionGps) {
  if (precisionGps == null) return { label: 'N/A', color: 'text-slate-500', dot: 'bg-slate-500' };
  const val = Number(precisionGps);
  if (val <= 20) return { label: 'Excelente', color: 'text-emerald-400', dot: 'bg-emerald-500' };
  if (val <= 50) return { label: 'Buena', color: 'text-amber-400', dot: 'bg-amber-500' };
  return { label: 'Débil', color: 'text-rose-400', dot: 'bg-rose-500' };
}

export default function TrackingMap({
  selectedEmployee,
  employees,
  triggerFitBounds,
  setTriggerFitBounds,
  showGeofencesLayer,
  showLabelsLayer,
  showRoutesLayer,
  polylineCoords,
  filteredHistory,
  playbackIndex,
  handleSelectEmployee,
  handleForceClockout,
  handleReallocateGeofence,
  mapCenter
}) {

  // Crear icono de marcador según estado
  const getMarkerIcon = (emp) => {
    const fuera = emp.fueraDeGeocerca === true;
    const conexion = emp.estadoConexion || emp;
    const tieneAnomalia = emp.anomaliasHoy > 0 || emp.ultimaAnomalia != null;

    let color = '#64748b'; // slate (desconectado)
    let size = 26; // Hacerlo más grande para las iniciales
    let extra = '';

    if (tieneAnomalia) {
      color = '#ef4444'; // Rojo crítico
      size = 28;
      extra = 'animation: pulse-alert 0.8s infinite; border: 3px solid #fef08a;';
    } else if (fuera) {
      color = '#f43f5e'; // rose — FUERA DE GEOCERCA
      size = 28;
      extra = 'animation: pulse-alert 1.5s infinite;';
    } else if (conexion === 'ACTIVO' || (typeof conexion === 'object' && conexion.estadoConexion === 'ACTIVO')) {
      color = '#10b981'; // emerald
    } else if (conexion === 'INACTIVO' || (typeof conexion === 'object' && conexion.estadoConexion === 'INACTIVO')) {
      color = '#f59e0b'; // amber
    }

    const initials = emp.empleadoNombre ? getInitials(emp.empleadoNombre) : '';

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px ${color}80;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: inherit;
        font-size: 8px;
        font-weight: 900;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        ${extra}
      ">${initials}</div>
      <style>
        @keyframes pulse-alert {
          0%, 100% { box-shadow: 0 0 8px ${color}60; transform: scale(1); }
          50% { box-shadow: 0 0 20px ${color}; transform: scale(1.3); }
        }
      </style>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  return (
    <div className="flex-1 z-10 bg-slate-950 h-full relative">
      <MapContainer
        center={mapCenter || DEFAULT_CENTER}
        zoom={13}
        style={MAP_STYLE}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController
          selectedEmployee={selectedEmployee}
          employees={employees}
          triggerFitBounds={triggerFitBounds}
          setTriggerFitBounds={setTriggerFitBounds}
        />

        {/* Círculos de Geocerca */}
        {showGeofencesLayer && employees.map((emp) => {
          if (!emp.geocercaLatitud || !emp.geocercaLongitud || !emp.geocercaRadioMetros) return null;
          const gLat = Number(emp.geocercaLatitud);
          const gLng = Number(emp.geocercaLongitud);
          if (isNaN(gLat) || isNaN(gLng)) return null;

          const fuera = emp.fueraDeGeocerca === true;
          return (
            <Circle
              key={`geocerca-${emp.empleadoId}`}
              center={[gLat, gLng]}
              radius={emp.geocercaRadioMetros}
              pathOptions={{
                color: fuera ? '#f43f5e' : '#10b981',
                fillColor: fuera ? '#f43f5e' : '#10b981',
                fillOpacity: 0.08,
                weight: 2,
                dashArray: fuera ? '8, 6' : '4, 4',
                opacity: 0.6
              }}
            >
              <Popup>
                <div className="text-slate-950 text-xs p-1">
                  <strong>{emp.geocercaDescripcion || 'Geocerca'}</strong>
                  <p>Radio: {emp.geocercaRadioMetros}m</p>
                  <p>Empleado: {emp.empleadoNombre}</p>
                  <p>{fuera ? '🔴 FUERA del perímetro' : '🟢 DENTRO del perímetro'}</p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Marcadores de Empleados */}
        {employees.map((emp) => {
          const lat = Number(emp.latitud);
          const lng = Number(emp.longitud);
          if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return null;
          const fuera = emp.fueraDeGeocerca === true;
          const gps = getGpsQuality(emp.precisionGps);

          return (
            <Marker
              key={emp.empleadoId}
              position={[lat, lng]}
              icon={getMarkerIcon(emp)}
            >
              {showLabelsLayer && (
                <Tooltip
                  permanent
                  direction="top"
                  offset={[0, -14]}
                  className="bg-slate-900/90 border border-slate-750 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-md opacity-90 pointer-events-none select-none"
                >
                  {emp.empleadoNombre}
                </Tooltip>
              )}
              <Popup className="custom-popup" maxWidth={280}>
                <div className="text-slate-950 p-1 min-w-[220px]">
                  <h4 className="font-bold text-sm mb-2 flex items-center justify-between">
                    {emp.empleadoNombre}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${fuera ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {fuera ? '⚠ FUERA' : '✓ EN ZONA'}
                    </span>
                  </h4>

                  <div className="space-y-1 text-xs font-semibold text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Conexión:</span>
                      <strong>{emp.estadoConexion}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">GPS precisión:</span>
                      <span className={gps.color}>{emp.precisionGps != null ? `${Number(emp.precisionGps).toFixed(0)}m (${gps.label})` : 'N/A'}</span>
                    </div>
                    {emp.ultimaActualizacion && (
                      <div className="flex justify-between border-t pt-1 mt-1 border-slate-200">
                        <span className="text-slate-455 font-medium">Actualizado:</span>
                        <span className="text-slate-650 font-mono">{new Date(emp.ultimaActualizacion).toLocaleTimeString()}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-1.5 pt-2.5 border-t border-slate-200 uppercase tracking-widest text-[8px] font-bold">
                      <button
                        onClick={() => {
                          handleSelectEmployee(emp);
                        }}
                        className="w-full text-center px-2 py-1 bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white rounded shadow-xs cursor-pointer"
                      >
                        Ver Historial de Ruta
                      </button>
                      <div className="flex gap-1.5">
                        {emp.jornadaEstado === 'EN_JORNADA' && (
                          <button
                            onClick={() => handleForceClockout(emp.empleadoId)}
                            className="flex-1 px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded shadow-xs cursor-pointer"
                          >
                            Cerrar Turno
                          </button>
                        )}
                        <button
                          onClick={() => handleReallocateGeofence(emp)}
                          className="flex-1 px-2 py-1 bg-purple-655 hover:bg-purple-750 text-white rounded shadow-xs cursor-pointer"
                        >
                          Mover Geocerca
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Ruta histórica */}
        {showRoutesLayer && polylineCoords.length > 0 && (
          <>
            <Polyline positions={polylineCoords} color="#3b82f6" weight={4} dashArray="5, 10" />
            <Marker position={polylineCoords[0]} icon={getMarkerIcon({ estadoConexion: 'INACTIVO' })}>
              <Popup><div className="text-slate-950 text-xs">Punto de inicio de ruta</div></Popup>
            </Marker>
            <Marker position={polylineCoords[polylineCoords.length - 1]} icon={getMarkerIcon({ estadoConexion: 'ACTIVO' })}>
              <Popup><div className="text-slate-950 text-xs">Punto final de ruta</div></Popup>
            </Marker>
          </>
        )}

        {/* Animación del Avatar Marker en la Ruta Histórica */}
        {showRoutesLayer && filteredHistory.length > 0 && filteredHistory[playbackIndex] && (
          <Marker
            position={[Number(filteredHistory[playbackIndex].latitud), Number(filteredHistory[playbackIndex].longitud)]}
            icon={L.divIcon({
              className: 'custom-div-icon',
              html: `<div style="
                background-color: #3b82f6;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 16px #3b82f6;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 8px;
                color: white;
                font-weight: bold;
              ">🚗</div>`
            })}
          >
            <Popup>
              <div className="text-slate-950 text-xs">
                <strong>Ubicación Histórica ({selectedEmployee?.empleadoNombre})</strong>
                <p className="mt-1 font-mono text-3xs">
                  Hora: {filteredHistory[playbackIndex].registradoEn ? new Date(filteredHistory[playbackIndex].registradoEn).toLocaleString() : `Punto ${playbackIndex + 1}`}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
