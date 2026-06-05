import { useState, useEffect } from 'react';
import { empleadoService } from '../services/empleadoService';
import { useBackgroundLocation } from '../services/useBackgroundLocation';
import ClockingCard from '../components/ClockingCard';
import JustificacionForm from '../components/JustificacionForm';
import EmpleadoLayout from '../components/EmpleadoLayout';
import { Clock, ShieldAlert } from 'lucide-react';

export default function EmpleadoDashboardPage() {
  const [panelData, setPanelData] = useState(null);
  const [geocercas, setGeocercas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPanel = async () => {
    try {
      const data = await empleadoService.getPanel();
      setPanelData(data);
      
      try {
        const geos = await empleadoService.getMisGeocercas();
        setGeocercas(geos);
      } catch (geoErr) {
        console.error('Error al cargar geocercas:', geoErr);
        setGeocercas([]);
      }
    } catch (err) {
      console.error('Error crítico al cargar panel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPanel();
    
    // Polling de respaldo cada 30 segundos por si SSE se desconecta
    const interval = setInterval(fetchPanel, 30000);
    return () => clearInterval(interval);
  }, []);

  // Habilitar el hook de geolocalización en segundo plano únicamente si la jornada laboral de hoy está activa
  const jornadaActiva = panelData?.estadoLaboral === 'JORNADA_ACTIVA';
  useBackgroundLocation(jornadaActiva, 15000);

  return (
    <EmpleadoLayout>
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-2 border-[#1ba0f2] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Header */}
          <div className="border-l-4 border-[#1ba0f2] pl-4 text-left">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#1ba0f2]/20 bg-[#1ba0f2]/10 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#1ba0f2]">
              <Clock className="h-3 w-3" /> Marcaciones
            </span>
            <h1 className="mt-3 text-3xl font-extrabold text-[#0f2942] tracking-tighter leading-none">
              Control de Asistencia
            </h1>
            <p className="mt-2 text-xs text-slate-500 font-semibold leading-relaxed">
              Registre sus entradas, salidas y tiempos de almuerzo para la jornada de hoy.
            </p>
          </div>

          {/* Main Assist Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <ClockingCard panelData={panelData} geocercas={geocercas} onRefresh={fetchPanel} />
            
            <div className="space-y-6">
              <JustificacionForm panelData={panelData} />
              
              <div className="bg-white border border-slate-150 rounded-3xl p-6 flex gap-4 shadow-sm text-left">
                <ShieldAlert className="w-6 h-6 text-[#1ba0f2] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[#0f2942] font-extrabold text-sm mb-1">Información de Geolocalización</h4>
                  <p className="text-slate-550 text-xs leading-relaxed font-semibold">
                    Si estás en modalidad <strong>remota</strong>, el sistema realizará capturas periódicas automáticas de tu GPS únicamente mientras tengas una jornada laboral iniciada.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </EmpleadoLayout>
  );
}
