import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import EmpleadoLayout from '../components/EmpleadoLayout';
import { empleadoService } from '../services/empleadoService';
import { useAuthContext } from '../../../context/AuthContext';
import { 
  User, 
  Mail, 
  Shield, 
  Map, 
  MapPin, 
  Compass, 
  Loader2, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Building
} from 'lucide-react';

// Solución para iconos rotos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente helper para centrar el mapa cuando cambia la geocerca seleccionada
function ChangeMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 16, { animate: true });
    }
  }, [center, map]);
  return null;
}

export default function EmpleadoPerfilPage() {
  const { user } = useAuthContext();
  const [geocercas, setGeocercas] = useState([]);
  const [selectedGeocerca, setSelectedGeocerca] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Datos del perfil del JWT o fallback
  const userProfile = {
    nombre: user?.context?.nombre_completo || 'Carles Perez',
    correo: user?.sub || 'carles.perez@clara.com',
    rol: user?.roles?.[0] || 'EMPLEADO',
    tenantId: user?.tenantId || 'Sede Principal (Clara)',
    estado: 'ACTIVO'
  };

  useEffect(() => {
    const fetchGeocercas = async () => {
      try {
        const data = await empleadoService.getMisGeocercas();
        setGeocercas(data);
        if (data && data.length > 0) {
          setSelectedGeocerca(data[0]);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información de geocercas.');
      } finally {
        setLoading(false);
      }
    };
    fetchGeocercas();
  }, []);

  const getRolLabel = (role) => {
    if (role === 'EMPLEADO' || role === 'ROLE_EMPLEADO') return 'Colaborador';
    return role;
  };

  return (
    <EmpleadoLayout>
      <div className="space-y-8 text-left">
        
        {/* Header */}
        <div className="border-l-4 border-emerald-500 pl-4">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-250 bg-emerald-50 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-emerald-700">
            <User className="h-3 w-3" /> Datos de Identidad
          </span>
          <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
            Mi Perfil y Geocercas
          </h1>
          <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
            Consulte su información general y verifique los perímetros geográficos asignados para sus marcas de asistencia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Personal info card (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Detail Card */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10" />
              
              {/* Profile Avatar Header */}
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#0f2942] to-[#1ba0f2] p-1 flex items-center justify-center shadow-md">
                  <div className="h-full w-full rounded-full bg-white flex items-center justify-center text-[#0f2942] font-black text-2xl font-mono">
                    {userProfile.nombre.charAt(0)}
                  </div>
                </div>
                
                <h3 className="text-md font-extrabold text-[#0f2942] mt-4 leading-tight">
                  {userProfile.nombre}
                </h3>
                
                <span className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-700 inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Cuenta Activa
                </span>
              </div>

              {/* Personal details list */}
              <div className="mt-6 space-y-4 text-left">
                
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-450 shrink-0 border border-slate-100">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Correo Institucional</span>
                    <span className="text-xs font-semibold text-slate-700 font-mono break-all">{userProfile.correo}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-450 shrink-0 border border-slate-100">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Rol del Sistema</span>
                    <span className="text-xs font-semibold text-slate-700">{getRolLabel(userProfile.rol)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-450 shrink-0 border border-slate-100">
                    <Building className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">SaaS Tenant</span>
                    <span className="text-xs font-semibold text-slate-700">{userProfile.tenantId}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Geofence Info box */}
            <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-[#0f2942] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-[#1ba0f2]" /> Políticas de Geocercas
              </h4>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Su contrato posee vinculación con <strong>puntos geográficos obligatorios</strong>. Al realizar su marca de ingreso o salida en la pestaña de Control de Asistencia, el sistema comprobará su coordenada actual con el radio de tolerancia.
              </p>
              <div className="rounded-2xl border border-slate-150 bg-sky-50/20 p-3 flex gap-2.5 text-slate-650 leading-relaxed font-semibold">
                <Info className="h-4.5 w-4.5 text-[#1ba0f2] shrink-0 mt-0.5" />
                <p className="text-[9px] uppercase tracking-wide text-sky-950/80">
                  Las marcas por fuera de la geocerca remota requerirán justificación documentada para evitar penalizaciones salariales.
                </p>
              </div>
            </div>

          </div>

          {/* Right Column: Active Geofence & Leaflet map (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {loading ? (
              <div className="bg-white border border-slate-150 rounded-3xl p-12 shadow-sm flex flex-col justify-center items-center py-20 min-h-[450px]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-3">Cargando geocercas...</span>
              </div>
            ) : error ? (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm min-h-[450px] flex justify-center items-center">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex gap-2.5 items-start text-red-800 text-xs font-semibold">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              </div>
            ) : geocercas.length === 0 ? (
              <div className="bg-white border border-slate-150 rounded-3xl p-12 shadow-sm text-center text-slate-400 min-h-[450px] flex justify-center items-center">
                <span className="text-xs uppercase font-bold">No tiene geocercas de trabajo asignadas en el sistema.</span>
              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
                
                {/* Geofence selection & details */}
                <div className="flex flex-col md:flex-row justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest block">Geocerca Activa</span>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4.5 w-4.5 text-emerald-600" />
                      <h3 className="text-md font-extrabold text-[#0f2942]">
                        {selectedGeocerca?.descripcion}
                      </h3>
                    </div>
                  </div>

                  {/* Geofence metadata cards */}
                  <div className="flex flex-wrap gap-2.5">
                    <div className="rounded-xl border border-slate-150 bg-slate-50 px-3 py-1.5 text-left">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Radio Tolerancia</span>
                      <span className="block text-xs font-black text-[#0f2942] font-mono mt-0.5">
                        {selectedGeocerca?.radioToleranciaMetros} metros
                      </span>
                    </div>
                    <div className="rounded-xl border border-slate-150 bg-slate-50 px-3 py-1.5 text-left">
                      <span className="block text-[8px] font-extrabold text-slate-400 uppercase tracking-wider">Coordenadas</span>
                      <span className="block text-xs font-black text-[#0f2942] font-mono mt-0.5">
                        {selectedGeocerca?.latitud.toFixed(5)}, {selectedGeocerca?.longitud.toFixed(5)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Map Display */}
                <div className="relative h-[350px] rounded-2xl overflow-hidden border border-slate-150 shadow-inner">
                  {selectedGeocerca && (
                    <MapContainer
                      center={[selectedGeocerca.latitud, selectedGeocerca.longitud]}
                      zoom={16}
                      scrollWheelZoom={false}
                      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Leaflet marker & circle boundaries */}
                      <Marker position={[selectedGeocerca.latitud, selectedGeocerca.longitud]}>
                        <Popup>
                          <div className="text-left font-semibold text-3xs">
                            <strong className="text-xs text-[#0f2942]">{selectedGeocerca.descripcion}</strong>
                            <p className="mt-1 text-slate-500">Punto de Marcación Oficial</p>
                          </div>
                        </Popup>
                      </Marker>
                      
                      <Circle
                        center={[selectedGeocerca.latitud, selectedGeocerca.longitud]}
                        pathOptions={{ 
                          color: '#10b981', 
                          fillColor: '#10b981', 
                          fillOpacity: 0.15,
                          weight: 2
                        }}
                        radius={selectedGeocerca.radioToleranciaMetros}
                      />

                      <ChangeMapCenter center={[selectedGeocerca.latitud, selectedGeocerca.longitud]} />
                    </MapContainer>
                  )}
                </div>

                {/* List of other geofences (if multiple) */}
                {geocercas.length > 1 && (
                  <div>
                    <span className="block text-[9px] text-slate-400 font-extrabold uppercase tracking-widest mb-2.5">Otras Geocercas Disponibles</span>
                    <div className="flex gap-2 overflow-x-auto pb-1.5">
                      {geocercas.map((geo) => {
                        const isSelected = selectedGeocerca?.id === geo.id;
                        return (
                          <button
                            key={geo.id}
                            onClick={() => setSelectedGeocerca(geo)}
                            className={`px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider shrink-0 transition duration-150 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {geo.descripcion}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </EmpleadoLayout>
  );
}
