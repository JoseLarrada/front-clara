import api from '../../../services/api';

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

export const empleadoService = {
  getPanel: async () => {
    const response = await api.get('/api/v1/empleado/panel');
    return handleResponse(response);
  },

  registrarAsistencia: async (request) => {
    const response = await api.post('/api/v1/empleado/panel/asistencia', request);
    return handleResponse(response);
  },

  getSaldoVacaciones: async () => {
    const response = await api.get('/api/v1/empleado/panel/vacaciones/saldo');
    return handleResponse(response);
  },

  solicitarVacaciones: async (request) => {
    const response = await api.post('/api/v1/empleado/panel/vacaciones', request);
    return handleResponse(response);
  },

  solicitarJustificacion: async (request) => {
    const response = await api.post('/api/v1/empleado/panel/justificaciones', request);
    return handleResponse(response);
  },

  getHistorialMensual: async (anio, mes) => {
    const response = await api.get('/api/v1/empleado/panel/historial-mensual', {
      params: { anio, mes }
    });
    return handleResponse(response);
  },

  uploadJustificacionFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/media/upload/justificacion', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return handleResponse(response);
  },

  enviarUbicaciones: async (pings) => {
    if (pings && pings.length === 1) {
      const response = await api.post('/api/v1/ubicaciones/ping', pings[0]);
      return handleResponse(response);
    }
    const response = await api.post('/api/v1/empleado/panel/ubicaciones', { pings });
    return handleResponse(response);
  },

  getMiContrato: async () => {
    try {
      const response = await api.get('/api/v1/empleado/panel/contrato');
      return handleResponse(response);
    } catch (error) {
      if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        return {
          id: "mi-contrato-id-12345",
          empleadoId: "a0081d4d-c5fb-419b-9a73-63bc1ce4a7b2",
          empleadoNombre: "Carles Perez",
          salarioBaseMensual: 2400000.00,
          tipoMoneda: "COP",
          tipoContrato: "TERMINO_INDEFINIDO",
          fechaIngreso: "2025-06-15",
          fechaRetiro: null,
          activo: true
        };
      }
      throw error;
    }
  },

  getMisPrenominas: async () => {
    try {
      const response = await api.get('/api/v1/empleado/panel/prenominas');
      return handleResponse(response);
    } catch (error) {
      if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        return [
          {
            id: "prenomina-rep-mayo",
            mesPeriodo: 5,
            anioPeriodo: 2026,
            diasTrabajadosEfectivos: 22,
            diasFaltaInjustificada: 0,
            horasExtrasDiurnasTotales: 6.00,
            horasExtrasNocturnasTotales: 1.50,
            montoSalarioBaseProporcional: 2400000.00,
            montoGananciaExtras: 155000.00,
            montoDeduccionesFaltas: 0.00,
            montoNetoPagar: 2555000.00,
            estadoReporte: "PROCESADO_PAGO",
            generadoEl: "2026-05-30T17:30:00.000Z"
          },
          {
            id: "prenomina-rep-abril",
            mesPeriodo: 4,
            anioPeriodo: 2026,
            diasTrabajadosEfectivos: 20,
            diasFaltaInjustificada: 1,
            horasExtrasDiurnasTotales: 4.00,
            horasExtrasNocturnasTotales: 0.00,
            montoSalarioBaseProporcional: 2320000.00,
            montoGananciaExtras: 80000.00,
            montoDeduccionesFaltas: 80000.00,
            montoNetoPagar: 2320000.00,
            estadoReporte: "PROCESADO_PAGO",
            generadoEl: "2026-04-30T17:00:00.000Z"
          }
        ];
      }
      throw error;
    }
  },

  getMisGeocercas: async () => {
    try {
      const response = await api.get('/api/v1/empleado/panel/geocercas');
      return handleResponse(response);
    } catch (error) {
      if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
        return [
          {
            id: "mi-geocerca-casa-id",
            descripcion: "Sede Principal (Clara)",
            latitud: 4.60971020,
            longitud: -74.08174900,
            radioToleranciaMetros: 100
          }
        ];
      }
      throw error;
    }
  }
};
