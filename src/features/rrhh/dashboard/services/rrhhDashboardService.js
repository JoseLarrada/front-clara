import api from '../../../../services/api';

/**
 * Desenvuelve la respuesta estándar del backend si contiene la estructura { success, message, data }
 */
const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

/**
 * Obtiene las estadísticas de asistencia en tiempo real de la empresa
 * @param {string} [fecha] Fecha en formato YYYY-MM-DD (opcional)
 */
export const getRealTimeDashboardStats = async (fecha) => {
  try {
    const params = fecha ? { fecha } : {};
    const response = await api.get('/api/v1/admin/dashboard/tiempo-real', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Backend offline, usando estadísticas en tiempo real simuladas para RRHH.');
      return await mockGetRealTimeStats(fecha || new Date().toISOString().split('T')[0]);
    }
    throw error;
  }
};

/**
 * Simulación de estadísticas en tiempo real para desarrollo offline
 */
const mockGetRealTimeStats = (fecha) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        fecha,
        totalActivos: 86,
        totalPresentes: 62,
        totalAusentes: 24,
        totalTeletrabajo: 28,
        totalPresencial: 34,
        totalEnAlmuerzo: 8,
        totalRetardos: 5,
        totalFaltas: 3
      });
    }, 500);
  });
};
