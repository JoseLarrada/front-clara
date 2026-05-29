import { useState, useEffect, useRef } from 'react';
import { X, MapPin, ShieldAlert, Loader2, Info, Search, Compass } from 'lucide-react';

function loadLeaflet(callback) {
  if (window.L) {
    callback();
    return;
  }

  // Load Leaflet CSS
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link');
    link.id = 'leaflet-css';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  // Load Leaflet JS
  if (!document.getElementById('leaflet-js')) {
    const script = document.createElement('script');
    script.id = 'leaflet-js';
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => callback();
    document.body.appendChild(script);
  } else {
    const checkInterval = setInterval(() => {
      if (window.L) {
        clearInterval(checkInterval);
        callback();
      }
    }, 100);
  }
}

function GeocercaModal({ isOpen, onClose, onSubmit, activeGeocerca, apiError, actionLoading }) {
  const [formData, setFormData] = useState({
    descripcion: '',
    latitud: '4.609710',
    longitud: '-74.081750',
    radioToleranciaMetros: 100
  });

  const [localError, setLocalError] = useState('');
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadLeaflet(() => {
        setLeafletLoaded(true);
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (activeGeocerca) {
      setFormData({
        descripcion: activeGeocerca.descripcion || '',
        latitud: activeGeocerca.latitud !== undefined ? activeGeocerca.latitud.toString() : '4.609710',
        longitud: activeGeocerca.longitud !== undefined ? activeGeocerca.longitud.toString() : '-74.081750',
        radioToleranciaMetros: activeGeocerca.radioToleranciaMetros !== undefined ? activeGeocerca.radioToleranciaMetros : 100
      });
    } else {
      setFormData({
        descripcion: '',
        latitud: '4.609710',
        longitud: '-74.081750',
        radioToleranciaMetros: 100
      });
    }
    setLocalError('');
    setSearchAddress('');
  }, [activeGeocerca, isOpen]);

  // Initialize Map
  useEffect(() => {
    if (!isOpen || !leafletLoaded) return;

    const timer = setTimeout(() => {
      const container = document.getElementById('map-picker');
      if (!container) return;

      const defaultLat = Number(formData.latitud) || 4.609710;
      const defaultLng = Number(formData.longitud) || -74.081750;
      const defaultRad = Number(formData.radioToleranciaMetros) || 100;

      // Fix leaflet marker icon path issues using hosted assets
      const DefaultIcon = window.L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      window.L.Marker.prototype.options.icon = DefaultIcon;

      // Create map instance
      const mapInstance = window.L.map('map-picker').setView([defaultLat, defaultLng], 15);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Draggable marker
      const markerInstance = window.L.marker([defaultLat, defaultLng], { draggable: true }).addTo(mapInstance);

      // Visual radius circle
      const circleInstance = window.L.circle([defaultLat, defaultLng], {
        radius: defaultRad,
        color: '#1ba0f2',
        fillColor: '#1ba0f2',
        fillOpacity: 0.15,
        weight: 2
      }).addTo(mapInstance);

      mapRef.current = mapInstance;
      markerRef.current = markerInstance;
      circleRef.current = circleInstance;

      const updateLocation = (lat, lng) => {
        setFormData(prev => ({
          ...prev,
          latitud: lat.toFixed(6),
          longitud: lng.toFixed(6)
        }));
        circleInstance.setLatLng([lat, lng]);
      };

      // Marker events
      markerInstance.on('dragend', () => {
        const position = markerInstance.getLatLng();
        updateLocation(position.lat, position.lng);
      });

      // Map events
      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        markerInstance.setLatLng([lat, lng]);
        updateLocation(lat, lng);
      });

      // Avoid rendering bugs (gray squares) inside absolute elements/modals
      mapInstance.invalidateSize();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen, leafletLoaded, activeGeocerca]);

  // Sync circle radius
  useEffect(() => {
    if (circleRef.current) {
      const rad = Number(formData.radioToleranciaMetros);
      if (!isNaN(rad) && rad > 0) {
        circleRef.current.setRadius(rad);
      }
    }
  }, [formData.radioToleranciaMetros]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (localError) setLocalError('');
  };

  const handleCoordinateBlur = () => {
    const lat = Number(formData.latitud);
    const lng = Number(formData.longitud);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      if (mapRef.current && markerRef.current && circleRef.current) {
        const newLatLng = [lat, lng];
        mapRef.current.setView(newLatLng, mapRef.current.getZoom());
        markerRef.current.setLatLng(newLatLng);
        circleRef.current.setLatLng(newLatLng);
      }
    }
  };

  // Dynamic geocoding search using OpenStreetMap Nominatim
  const handleSearchAddress = async (e) => {
    e.preventDefault();
    if (!searchAddress.trim()) return;
    setSearchingAddress(true);
    setLocalError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        setFormData(prev => ({
          ...prev,
          latitud: newLat.toFixed(6),
          longitud: newLng.toFixed(6)
        }));

        if (mapRef.current && markerRef.current && circleRef.current) {
          const newLatLng = [newLat, newLng];
          mapRef.current.setView(newLatLng, 15);
          markerRef.current.setLatLng(newLatLng);
          circleRef.current.setLatLng(newLatLng);
        }
      } else {
        setLocalError('No se pudo encontrar ninguna ubicación para la dirección ingresada.');
      }
    } catch (err) {
      console.error('Error querying Nominatim Geocoding:', err);
      setLocalError('Error de red al consultar el mapa de direcciones.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const lat = Number(formData.latitud);
    const lng = Number(formData.longitud);
    const rad = Number(formData.radioToleranciaMetros);

    if (!formData.descripcion.trim()) {
      setLocalError('La descripción es obligatoria.');
      return;
    }
    if (isNaN(lat) || lat < -90.0 || lat > 90.0) {
      setLocalError('La latitud debe ser un número decimal entre -90.00 y 90.00.');
      return;
    }
    if (isNaN(lng) || lng < -180.0 || lng > 180.0) {
      setLocalError('La longitud debe ser un número decimal entre -180.00 y 180.00.');
      return;
    }
    if (isNaN(rad) || rad <= 0) {
      setLocalError('El radio de tolerancia debe ser un número entero mayor que 0 metros.');
      return;
    }

    onSubmit({
      descripcion: formData.descripcion,
      latitud: lat,
      longitud: lng,
      radioToleranciaMetros: rad
    });
  };

  const activeError = localError || apiError;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0f2942]/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-150 bg-white p-6 shadow-2xl z-10 text-left font-semibold text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
        
        <button
          type="button"
          onClick={onClose}
          disabled={actionLoading}
          className="absolute right-4 top-4 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#0f2942] transition cursor-pointer z-10"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1ba0f2]/10 text-[#1ba0f2] border border-[#1ba0f2]/20">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#0f2942] tracking-tight leading-none">
              {activeGeocerca ? 'Editar Geocerca' : 'Registrar Geocerca'}
            </h3>
            <p className="text-3xs text-slate-400 font-bold uppercase tracking-wider mt-1.5">
              {activeGeocerca ? 'Modifique los límites perimetrales del empleado' : 'Establezca una nueva zona de marcación remota'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {activeError && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-2xs font-bold text-red-650 border border-red-200 flex items-start gap-2 animate-in fade-in">
            <ShieldAlert className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{activeError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Nombre de Ubicación</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              disabled={actionLoading}
              placeholder="Ej: Oficina Central o Hogar Empleado"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs placeholder-slate-400 focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          {/* Buscador de Dirección */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Buscar por Dirección / Ciudad</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  placeholder="Ej: Calle 72, Bogotá, Colombia"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchAddress(e);
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={searchingAddress || actionLoading}
                className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0f2942] border border-slate-250 py-2 px-3.5 font-bold text-3xs uppercase tracking-wider transition cursor-pointer disabled:opacity-50"
              >
                {searchingAddress ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Compass className="h-3 w-3 text-[#1ba0f2]" />
                )}
                Buscar
              </button>
            </div>
          </div>

          {/* Mapa Interactivo */}
          <div className="space-y-1">
            <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Ubique el punto en el mapa</label>
            <div 
              id="map-picker" 
              className="h-44 w-full rounded-2xl border border-slate-200 bg-slate-50 z-0 shadow-inner overflow-hidden"
              style={{ minHeight: '176px' }}
            />
            <span className="block text-[10px] text-slate-400 font-bold leading-normal">
              * Puede hacer click en el mapa o arrastrar el marcador azul para fijar las coordenadas automáticamente.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Latitud */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Latitud (Decimal)</label>
              <input
                type="text"
                name="latitud"
                value={formData.latitud}
                onChange={handleChange}
                onBlur={handleCoordinateBlur}
                disabled={actionLoading}
                placeholder="4.609710"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-mono focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>

            {/* Longitud */}
            <div className="space-y-1">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider">Longitud (Decimal)</label>
              <input
                type="text"
                name="longitud"
                value={formData.longitud}
                onChange={handleChange}
                onBlur={handleCoordinateBlur}
                disabled={actionLoading}
                placeholder="-74.081750"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs font-mono focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
              />
            </div>
          </div>

          {/* Radio tolerancia */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-4xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                Radio de Tolerancia (Metros)
              </label>
              <div className="group relative cursor-pointer">
                <Info className="h-3.5 w-3.5 text-slate-350 hover:text-[#1ba0f2]" />
                <span className="pointer-events-none absolute bottom-full right-0 mb-1 w-48 rounded bg-slate-800 p-2 text-5xs leading-tight text-white opacity-0 transition group-hover:opacity-100 shadow-md z-20">
                  Rango perimetral permitido (en metros) desde las coordenadas centrales para validar la marcación.
                </span>
              </div>
            </div>
            <input
              type="number"
              name="radioToleranciaMetros"
              value={formData.radioToleranciaMetros}
              onChange={handleChange}
              disabled={actionLoading}
              min="1"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs focus:border-[#1ba0f2] focus:ring-1 focus:ring-[#1ba0f2] focus:outline-none transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-5">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-650 bg-white py-2.5 px-5 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="rounded-xl bg-[#1ba0f2] hover:bg-[#1ba0f2]/90 text-white py-2.5 px-6 font-bold shadow-md shadow-[#1ba0f2]/10 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {activeGeocerca ? 'Guardar Cambios' : 'Registrar Perímetro'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

export default GeocercaModal;
