import { useState, useEffect, useCallback } from 'react';
import { getRealTimeDashboardStats } from '../services/rrhhDashboardService';

export const useRRHHDashboard = () => {
  // Obtener fecha local de hoy en formato YYYY-MM-DD
  const getTodayString = () => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000; 
    return (new Date(Date.now() - tzOffset)).toISOString().split('T')[0];
  };

  const [fecha, setFecha] = useState(getTodayString());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getRealTimeDashboardStats(fecha);
      setStats(data);
    } catch (err) {
      console.error('Error fetching RRHH dashboard stats:', err);
      setError('No se pudieron cargar las estadísticas en tiempo real.');
    } finally {
      setLoading(false);
    }
  }, [fecha]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleFechaChange = (nuevaFecha) => {
    if (nuevaFecha) {
      setFecha(nuevaFecha);
    }
  };

  return {
    stats,
    fecha,
    loading,
    error,
    handleFechaChange,
    refetch: fetchStats
  };
};
