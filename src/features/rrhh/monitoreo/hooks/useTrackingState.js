import { useState, useEffect, useRef } from 'react';
import { monitoreoService } from '../services/monitoreoService';

const DEFAULT_CENTER = [4.60971, -74.08175];

const MOCK_EMPLOYEES = [
  {
    empleadoId: "emp-carles-perez",
    empleadoNombre: "Carles Perez",
    email: "carles.perez@clara.com",
    latitud: 4.6097123,
    longitud: -74.0817543,
    precisionGps: 12.0,
    velocidad: 0.0,
    estadoConexion: "ACTIVO",
    ultimaActualizacion: new Date().toISOString(),
    fueraDeGeocerca: false,
    jornadaEstado: "EN_JORNADA",
    modalidad: "REMOTO",
    geocercaLatitud: 4.60971020,
    geocercaLongitud: -74.08174900,
    geocercaRadioMetros: 100,
    geocercaDescripcion: "Sede Principal (Clara)",
    anomaliasHoy: 0
  },
  {
    empleadoId: "emp-maria-rodriguez",
    empleadoNombre: "Maria Rodriguez",
    email: "maria.rodriguez@clara.com",
    latitud: 4.6150000,
    longitud: -74.0750000,
    precisionGps: 14.5,
    velocidad: 1.5,
    estadoConexion: "ACTIVO",
    ultimaActualizacion: new Date().toISOString(),
    fueraDeGeocerca: false,
    jornadaEstado: "EN_JORNADA",
    modalidad: "REMOTO",
    geocercaLatitud: 4.61550000,
    geocercaLongitud: -74.07450000,
    geocercaRadioMetros: 120,
    geocercaDescripcion: "Sucursal Norte",
    anomaliasHoy: 0
  },
  {
    empleadoId: "emp-juan-perez",
    empleadoNombre: "Juan Perez",
    email: "juan.perez@clara.com",
    latitud: 4.6320000,
    longitud: -74.0900000,
    precisionGps: 55.0,
    velocidad: 0.0,
    estadoConexion: "ACTIVO",
    ultimaActualizacion: new Date().toISOString(),
    fueraDeGeocerca: true,
    jornadaEstado: "EN_JORNADA",
    modalidad: "REMOTO",
    geocercaLatitud: 4.60971020,
    geocercaLongitud: -74.08174900,
    geocercaRadioMetros: 100,
    geocercaDescripcion: "Sede Principal (Clara)",
    anomaliasHoy: 1
  }
];

export function useTrackingState() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapReady, setMapReady] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('employees'); // 'employees' | 'alerts' | 'history'

  // Historial de ruta del empleado seleccionado
  const [routeHistory, setRouteHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Estados específicos para la pestaña Historial
  const [historyEmployeeId, setHistoryEmployeeId] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState('ALL');
  const [filterDate, setFilterDate] = useState('');

  // Estados de Capas y Búsqueda en Vivo
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [triggerFitBounds, setTriggerFitBounds] = useState(false);
  const [showGeofencesLayer, setShowGeofencesLayer] = useState(true);
  const [showLabelsLayer, setShowLabelsLayer] = useState(true);
  const [showRoutesLayer, setShowRoutesLayer] = useState(true);

  // Alertas / Anomalías graves recibidas por WS
  const [activeAnomalies, setActiveAnomalies] = useState([]);
  const [toastAlert, setToastAlert] = useState(null);
  const [auditAnomaly, setAuditAnomaly] = useState(null);

  // DevTools / Simulación
  const [showDevTools, setShowDevTools] = useState(false);
  const socketRef = useRef(null);

  // --- REFUERZOS ADMINISTRATIVOS ---
  const [isResolutionOpen, setIsResolutionOpen] = useState(false);
  const [anomalyToResolve, setAnomalyToResolve] = useState(null);
  const [actionLoadingState, setActionLoadingState] = useState(false);

  // Playback del Historial de Ruta
  const [isPlayingRoute, setIsPlayingRoute] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackTimerRef = useRef(null);

  // 1. Filtrar los empleados en base a la búsqueda en vivo
  const filteredEmployees = employees.filter(emp =>
    emp.empleadoNombre.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    (emp.email && emp.email.toLowerCase().includes(employeeSearch.toLowerCase()))
  );

  // 2. Filtrar el historial en caliente en base a los criterios de búsqueda y filtros locales
  const filteredHistory = routeHistory.filter(item => {
    // Filtrado por fecha
    if (filterDate) {
      const itemDateStr = item.registradoEn ? item.registradoEn.substring(0, 10) : '';
      if (itemDateStr !== filterDate) return false;
    }
    // Filtrado por tipo
    if (historyFilterType === 'OUT_OF_GEOFENCE' && item.fueraDeGeocerca !== true) return false;
    if (historyFilterType === 'MOCK_LOCATION' && item.esMockLocation !== true) return false;

    // Buscador de texto
    if (historySearch) {
      const search = historySearch.toLowerCase();
      const itemTime = item.registradoEn ? new Date(item.registradoEn).toLocaleTimeString().toLowerCase() : '';
      const lat = item.latitud ? String(item.latitud) : '';
      const lng = item.longitud ? String(item.longitud) : '';
      if (!itemTime.includes(search) && !lat.includes(search) && !lng.includes(search)) return false;
    }

    return true;
  });

  // Coordenadas para la línea de ruta histórica
  const polylineCoords = filteredHistory
    .map(pt => [Number(pt.latitud), Number(pt.longitud)])
    .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0);

  const togglePlayback = () => {
    setIsPlayingRoute(prev => !prev);
  };

  // Temporizador para la reproducción de la ruta
  useEffect(() => {
    if (!isPlayingRoute) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    const intervalTime = 1000 / playbackSpeed;
    playbackTimerRef.current = setInterval(() => {
      setPlaybackIndex(prevIndex => {
        if (prevIndex >= filteredHistory.length - 1) {
          setIsPlayingRoute(false);
          return 0; // Reiniciar
        }
        return prevIndex + 1;
      });
    }, intervalTime);

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlayingRoute, playbackSpeed, filteredHistory]);

  useEffect(() => {
    setPlaybackIndex(0);
    setIsPlayingRoute(false);
  }, [filteredHistory]);

  // Cargar lista inicial
  const fetchEmployeesData = async () => {
    try {
      const data = await monitoreoService.getEmployeesMonitoreo();
      if (Array.isArray(data)) {
        setEmployees(data);
      } else {
        setEmployees([]);
      }
      setTriggerFitBounds(true);
    } catch (err) {
      console.warn('Error al cargar monitoreo inicial del backend. Usando respaldo offline.', err);
      setEmployees(MOCK_EMPLOYEES);
      setTriggerFitBounds(true);
    }
  };

  // Carga automática del historial de ruta
  const handleFetchHistory = async (empId) => {
    const targetId = empId || historyEmployeeId || selectedEmployee?.empleadoId;
    if (!targetId) return;
    setLoadingHistory(true);
    setHistoryError(null);
    setRouteHistory([]);

    try {
      const data = await monitoreoService.getEmployeeRuta(targetId, filterDate);
      if (!data || data.length === 0) {
        setHistoryError('No se encontraron registros de ruta para este colaborador.');
      } else {
        setRouteHistory(data);
        const emp = employees.find(e => e.empleadoId === targetId);
        if (emp) {
          setSelectedEmployee(emp);
        }
        const first = data[0];
        const lat = Number(first.latitud);
        const lng = Number(first.longitud);
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          setMapCenter([lat, lng]);
        }
      }
    } catch (err) {
      console.warn('Fallo cargando historial, cargando ruta simulada de desarrollo.', err);
      setTimeout(() => {
        const emp = employees.find(e => e.empleadoId === targetId) || selectedEmployee || MOCK_EMPLOYEES[0];
        const baseLat = Number(emp.latitud) || DEFAULT_CENTER[0];
        const baseLng = Number(emp.longitud) || DEFAULT_CENTER[1];

        const hoy = new Date();
        const ayer = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const mockRoute = [
          { latitud: baseLat - 0.002, longitud: baseLng - 0.002, registradoEn: new Date(ayer.setHours(8, 0, 0)).toISOString(), fueraDeGeocerca: false },
          { latitud: baseLat - 0.001, longitud: baseLng - 0.001, registradoEn: new Date(ayer.setHours(10, 30, 0)).toISOString(), fueraDeGeocerca: true, esMockLocation: true },
          { latitud: baseLat, longitud: baseLng, registradoEn: new Date(ayer.setHours(12, 15, 0)).toISOString(), fueraDeGeocerca: false },
          { latitud: baseLat + 0.001, longitud: baseLng + 0.001, registradoEn: new Date(hoy.setHours(9, 15, 0)).toISOString(), fueraDeGeocerca: false },
          { latitud: baseLat + 0.002, longitud: baseLng + 0.002, registradoEn: new Date(hoy.setHours(14, 0, 0)).toISOString(), fueraDeGeocerca: false }
        ];
        setSelectedEmployee(emp);
        setRouteHistory(mockRoute);
        setMapCenter([baseLat, baseLng]);
        setLoadingHistory(false);
      }, 500);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (historyEmployeeId) {
      handleFetchHistory(historyEmployeeId);
    } else {
      setRouteHistory([]);
      setHistoryError(null);
    }
  }, [historyEmployeeId, filterDate]);

  const handleSelectEmployee = (emp) => {
    setSelectedEmployee(emp);
    setHistoryEmployeeId(emp.empleadoId);
    setRouteHistory([]);
    setHistoryError(null);
    setFilterDate('');
    setSidebarTab('history');
    const lat = Number(emp.latitud);
    const lng = Number(emp.longitud);
    if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
      setMapCenter([lat, lng]);
    } else if (emp.geocercaLatitud && emp.geocercaLongitud) {
      setMapCenter([Number(emp.geocercaLatitud), Number(emp.geocercaLongitud)]);
    }
  };

  // Acciones administrativas
  const handleResolveAnomaly = async (anomalyId, comentario, estado) => {
    try {
      await monitoreoService.resolverAnomalia(anomalyId, comentario, estado);
      setActiveAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      alert('Anomalía resuelta y archivada correctamente.');
    } catch (err) {
      console.warn('Backend resolution endpoint error, updating local UI.', err);
      setActiveAnomalies(prev => prev.filter(a => a.id !== anomalyId));
      alert('Anomalía resuelta y archivada (Simulado offline).');
    }
  };

  const handleForceClockout = async (empleadoId) => {
    if (!window.confirm('¿Está seguro de forzar el cierre de turno administrativamente para este empleado?')) {
      return;
    }
    setActionLoadingState(true);
    try {
      await monitoreoService.forzarSalida(empleadoId);
      alert('Turno finalizado con éxito.');
      setEmployees(prev => prev.map(e => e.empleadoId === empleadoId ? { ...e, jornadaEstado: 'FINALIZADA' } : e));
      if (selectedEmployee?.empleadoId === empleadoId) {
        setSelectedEmployee(prev => ({ ...prev, jornadaEstado: 'FINALIZADA' }));
      }
    } catch (err) {
      console.warn('Forced clock-out error, simulating locally.', err);
      setEmployees(prev => prev.map(e => e.empleadoId === empleadoId ? { ...e, jornadaEstado: 'FINALIZADA' } : e));
      if (selectedEmployee?.empleadoId === empleadoId) {
        setSelectedEmployee(prev => ({ ...prev, jornadaEstado: 'FINALIZADA' }));
      }
      alert('Turno finalizado con éxito (Simulado offline).');
    } finally {
      setActionLoadingState(false);
    }
  };

  const handleReallocateGeofence = async (emp) => {
    if (!emp.latitud || !emp.longitud) {
      alert('El colaborador no cuenta con coordenadas GPS reportadas.');
      return;
    }
    if (!window.confirm(`¿Desea reubicar la geocerca de ${emp.empleadoNombre} a su ubicación GPS actual (${Number(emp.latitud).toFixed(5)}, ${Number(emp.longitud).toFixed(5)})?`)) {
      return;
    }
    setActionLoadingState(true);
    try {
      await monitoreoService.reubicarGeocerca(emp.empleadoId, emp.latitud, emp.longitud);
      alert('Geocerca reubicada con éxito.');
      setEmployees(prev => prev.map(e => e.empleadoId === emp.empleadoId ? {
        ...e,
        geocercaLatitud: emp.latitud,
        geocercaLongitud: emp.longitud,
        fueraDeGeocerca: false
      } : e));
      if (selectedEmployee?.empleadoId === emp.empleadoId) {
        setSelectedEmployee(prev => ({
          ...prev,
          geocercaLatitud: emp.latitud,
          geocercaLongitud: emp.longitud,
          fueraDeGeocerca: false
        }));
      }
    } catch (err) {
      console.warn('Geofence reallocation error, simulating locally.', err);
      setEmployees(prev => prev.map(e => e.empleadoId === emp.empleadoId ? {
        ...e,
        geocercaLatitud: emp.latitud,
        geocercaLongitud: emp.longitud,
        fueraDeGeocerca: false
      } : e));
      if (selectedEmployee?.empleadoId === emp.empleadoId) {
        setSelectedEmployee(prev => ({
          ...prev,
          geocercaLatitud: emp.latitud,
          geocercaLongitud: emp.longitud,
          fueraDeGeocerca: false
        }));
      }
      alert('Geocerca reubicada con éxito (Simulado offline).');
    } finally {
      setActionLoadingState(false);
    }
  };

  // Inicialización y WebSockets
  useEffect(() => {
    setMapReady(true);
    fetchEmployeesData();

    const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080')
      .replace('http://', 'ws://')
      .replace('https://', 'wss://') + '/ws/ubicaciones';

    let socket = null;
    let reconnectTimeout = null;
    let isUnmounted = false;

    const connectWebSocket = () => {
      if (isUnmounted) return;

      console.log('Conectando a WebSocket de Geolocalización:', wsUrl);
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);

          // 1. Anomalía Grave
          if (update.event === 'ANOMALIA_GRAVE' || update.tipoAnomalia) {
            console.warn('¡Anomalía Grave recibida por WebSocket!', update);

            // Alerta acústica
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioCtx.createOscillator();
              const gainNode = audioCtx.createGain();
              oscillator.type = 'sine';
              oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
              gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
              oscillator.connect(gainNode);
              gainNode.connect(audioCtx.destination);
              oscillator.start();
              setTimeout(() => oscillator.stop(), 300);
            } catch (soundErr) {
              // Silenciar autoplay errors
            }

            setToastAlert(update);
            setActiveAnomalies(prev => [update, ...prev].slice(0, 20));

            setEmployees(prev => {
              return prev.map(e => {
                if (e.empleadoId === update.empleadoId) {
                  return {
                    ...e,
                    anomaliasHoy: (e.anomaliasHoy || 0) + 1,
                    fueraDeGeocerca: update.tipoAnomalia === 'FUERA_DE_GEOCERCA' ? true : e.fueraDeGeocerca,
                    ultimaAnomalia: update
                  };
                }
                return e;
              });
            });

            setSelectedEmployee(current => {
              if (current && current.empleadoId === update.empleadoId) {
                return {
                  ...current,
                  anomaliasHoy: (current.anomaliasHoy || 0) + 1,
                  fueraDeGeocerca: update.tipoAnomalia === 'FUERA_DE_GEOCERCA' ? true : current.fueraDeGeocerca,
                  ultimaAnomalia: update
                };
              }
              return current;
            });
            return;
          }

          // 2. Coordenadas Estándar
          setEmployees(prev => {
            const index = prev.findIndex(e => e.empleadoId === update.empleadoId);
            if (index !== -1) {
              const updated = [...prev];
              updated[index] = {
                ...updated[index],
                latitud: update.latitud,
                longitud: update.longitud,
                precisionGps: update.precisionGps,
                velocidad: update.velocidad,
                estadoConexion: update.estadoConexion,
                ultimaActualizacion: update.registradoEn || update.creadoEn || new Date().toISOString(),
                fueraDeGeocerca: update.fueraDeGeocerca != null ? update.fueraDeGeocerca : updated[index].fueraDeGeocerca,
                jornadaEstado: updated[index].jornadaEstado === 'NO_INICIADA' ? 'EN_JORNADA' : updated[index].jornadaEstado
              };
              return updated;
            } else {
              return [...prev, { ...update, jornadaEstado: 'EN_JORNADA' }];
            }
          });

          setSelectedEmployee(current => {
            if (current && current.empleadoId === update.empleadoId) {
              return {
                ...current,
                latitud: update.latitud,
                longitud: update.longitud,
                precisionGps: update.precisionGps,
                velocidad: update.velocidad,
                estadoConexion: update.estadoConexion,
                ultimaActualizacion: update.registradoEn || update.creadoEn || new Date().toISOString(),
                fueraDeGeocerca: update.fueraDeGeocerca != null ? update.fueraDeGeocerca : current.fueraDeGeocerca,
                jornadaEstado: current.jornadaEstado === 'NO_INICIADA' ? 'EN_JORNADA' : current.jornadaEstado
              };
            }
            return current;
          });
        } catch (e) {
          console.error('Error parseando mensaje WebSocket:', e);
        }
      };

      socket.onerror = () => {
        console.warn('Error en la conexión WebSocket de geolocalización. Reintentando...');
      };

      socket.onclose = () => {
        if (!isUnmounted) {
          reconnectTimeout = setTimeout(connectWebSocket, 5000);
        }
      };
    };

    connectWebSocket();

    return () => {
      isUnmounted = true;
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, []);

  // Limpiar Toast de Alerta
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => {
        setToastAlert(null);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // DevTools / Simulación
  const simulateAnomalyEvent = (type) => {
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)] || MOCK_EMPLOYEES[0];

    let detalles = "";
    if (type === 'MOCK_LOCATION_DETECTADA') {
      detalles = `GPS simulado detectado para el colaborador ${randomEmployee.empleadoNombre} (ID: ${randomEmployee.empleadoId.substring(0, 8)}). Coordenadas enviadas: Lat=${randomEmployee.latitud || 4.6097}, Lon=${randomEmployee.longitud || -74.0817}. Origen: BOTON_REMOTO.`;
    } else if (type === 'FACE_MISMATCH') {
      detalles = `Verificación de rostro fallida para ${randomEmployee.empleadoNombre}. Coincidencia biométrica del 61.45% por debajo del umbral mínimo del 80%. Imagen capturada en S3.`;
    } else {
      detalles = `Colaborador ${randomEmployee.empleadoNombre} se encuentra por fuera de su geocerca asignada '${randomEmployee.geocercaDescripcion || 'Sede Principal'}'. Distancia calculada: 485 metros.`;
    }

    const mockAlert = {
      event: "ANOMALIA_GRAVE",
      id: `sim-anom-${Date.now()}`,
      empleadoId: randomEmployee.empleadoId,
      empleadoNombre: randomEmployee.empleadoNombre,
      tipoAnomalia: type,
      detallesTecnicos: detalles,
      creadoEn: new Date().toISOString()
    };

    setToastAlert(mockAlert);
    setActiveAnomalies(prev => [mockAlert, ...prev].slice(0, 20));

    setEmployees(prev => {
      return prev.map(e => {
        if (e.empleadoId === mockAlert.empleadoId) {
          return {
            ...e,
            anomaliasHoy: (e.anomaliasHoy || 0) + 1,
            fueraDeGeocerca: type === 'FUERA_DE_GEOCERCA' ? true : e.fueraDeGeocerca,
            ultimaAnomalia: mockAlert
          };
        }
        return e;
      });
    });

    if (selectedEmployee?.empleadoId === mockAlert.empleadoId) {
      setSelectedEmployee(prev => ({
        ...prev,
        anomaliasHoy: (prev.anomaliasHoy || 0) + 1,
        fueraDeGeocerca: type === 'FUERA_DE_GEOCERCA' ? true : prev.fueraDeGeocerca,
        ultimaAnomalia: mockAlert
      }));
    }
  };

  const totalAnomalias = employees.reduce((sum, e) => sum + (e.anomaliasHoy || 0), 0) + activeAnomalies.length;
  const empleadosConJornada = employees.filter(e => e.jornadaEstado === 'EN_JORNADA' || e.jornadaEstado === 'ALMUERZO');
  const empleadosEnZona = empleadosConJornada.filter(e => e.fueraDeGeocerca !== true);
  const empleadosFuera = employees.filter(e => e.fueraDeGeocerca === true);

  return {
    employees,
    selectedEmployee,
    setSelectedEmployee,
    mapCenter,
    setMapCenter,
    mapReady,
    sidebarTab,
    setSidebarTab,
    routeHistory,
    loadingHistory,
    historyError,
    historyEmployeeId,
    setHistoryEmployeeId,
    historySearch,
    setHistorySearch,
    historyFilterType,
    setHistoryFilterType,
    filterDate,
    setFilterDate,
    employeeSearch,
    setEmployeeSearch,
    triggerFitBounds,
    setTriggerFitBounds,
    showGeofencesLayer,
    setShowGeofencesLayer,
    showLabelsLayer,
    setShowLabelsLayer,
    showRoutesLayer,
    setShowRoutesLayer,
    activeAnomalies,
    toastAlert,
    setToastAlert,
    auditAnomaly,
    setAuditAnomaly,
    showDevTools,
    setShowDevTools,
    isResolutionOpen,
    setIsResolutionOpen,
    anomalyToResolve,
    setAnomalyToResolve,
    actionLoadingState,
    isPlayingRoute,
    playbackIndex,
    setPlaybackIndex,
    playbackSpeed,
    setPlaybackSpeed,
    setRouteHistory,
    filteredEmployees,
    filteredHistory,
    polylineCoords,
    togglePlayback,
    fetchEmployeesData,
    handleFetchHistory,
    handleSelectEmployee,
    handleResolveAnomaly,
    handleForceClockout,
    handleReallocateGeofence,
    simulateAnomalyEvent,
    totalAnomalias,
    empleadosConJornada,
    empleadosEnZona,
    empleadosFuera
  };
}
