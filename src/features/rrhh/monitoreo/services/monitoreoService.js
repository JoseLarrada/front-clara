import api from '../../../../services/api';

/**
 * Desempaqueta de forma robusta la respuesta del API.
 * Soporta respuestas directas (arrays/objetos) y respuestas envueltas en { success: true, data: ... }.
 */
const unpack = (response) => {
  const data = response?.data;
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data;
  }
  return data;
};

export const monitoreoService = {
  /**
   * Obtiene la información en tiempo real de todos los colaboradores para el panel administrativo.
   * Ruta: GET /api/v1/admin/empleados/monitoreo
   */
  getEmployeesMonitoreo: async () => {
    const response = await api.get('/api/v1/admin/empleados/monitoreo');
    return unpack(response);
  },

  /**
   * Obtiene la última ubicación reportada de todos los empleados activos.
   * Ruta: GET /api/v1/admin/empleados/ultimas-ubicaciones
   */
  getUltimasUbicaciones: async () => {
    const response = await api.get('/api/v1/admin/empleados/ultimas-ubicaciones');
    return unpack(response);
  },

  /**
   * Obtiene el recorrido histórico de pings de GPS de un colaborador.
   * Si 'fecha' no se proporciona o es vacía, el backend entrega el historial completo.
   * Ruta: GET /api/v1/admin/empleados/{empleadoId}/ruta
   */
  getEmployeeRuta: async (empleadoId, fecha) => {
    const params = {};
    if (fecha && fecha !== 'null' && fecha !== 'undefined') {
      params.fecha = fecha;
    }
    const response = await api.get(`/api/v1/admin/empleados/${empleadoId}/ruta`, { params });
    return unpack(response);
  },

  /**
   * Resuelve una anomalía grave ingresando un comentario de auditoría.
   * Ruta: POST /api/v1/admin/anomalias/{anomalyId}/resolver
   */
  resolverAnomalia: async (anomalyId, comentario, estado) => {
    const response = await api.post(`/api/v1/admin/anomalias/${anomalyId}/resolver`, {
      comentario,
      estado
    });
    return unpack(response);
  },

  /**
   * Fuerza el cierre de jornada/salida de un empleado.
   * Ruta: POST /api/v1/admin/asistencia/forzar-salida/{empleadoId}
   */
  forzarSalida: async (empleadoId) => {
    const response = await api.post(`/api/v1/admin/asistencia/forzar-salida/${empleadoId}`);
    return unpack(response);
  },

  /**
   * Reubica el perímetro de la geocerca a las coordenadas GPS actuales de un empleado.
   * Ruta: POST /api/v1/admin/empleados/{empleadoId}/geocerca/reubicar
   */
  reubicarGeocerca: async (empleadoId, latitud, longitud) => {
    const response = await api.post(`/api/v1/admin/empleados/${empleadoId}/geocerca/reubicar`, {
      latitud,
      longitud
    });
    return unpack(response);
  }
};
