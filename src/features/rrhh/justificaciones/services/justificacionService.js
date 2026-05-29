import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockJustificaciones = [
  {
    id: "1fa02bd8-e65c-44bc-87bd-ea8a2879cf10",
    registroAsistenciaId: "bc108cf2-29da-411a-a002-c6cb92f98ccf",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    empleadoNombre: "Carlos Pérez González",
    fecha: "2026-05-27",
    motivoEmpleado: "Cita médica programada de control en EPS por salud ocupacional.",
    urlComprobanteS3: "https://s3.amazonaws.com/cloudtime-buckets/justificaciones/comprobante_cita_carlos.pdf",
    estadoSolicitud: "PENDIENTE",
    comentariosAdministrador: null,
    procesadoEn: null,
    creadoEn: "2026-05-27T10:30:00.000Z"
  },
  {
    id: "1fa02bd8-e65c-44bc-87bd-ea8a2879cf11",
    registroAsistenciaId: "bc108cf2-29da-411a-a002-c6cb92f98cd0",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", // Ana María Silva
    empleadoNombre: "Ana María Silva",
    fecha: "2026-05-26",
    motivoEmpleado: "Corte de servicio eléctrico en la zona residencial certificado por empresa de energía.",
    urlComprobanteS3: "https://s3.amazonaws.com/cloudtime-buckets/justificaciones/certificado_corte_luz.pdf",
    estadoSolicitud: "PENDIENTE",
    comentariosAdministrador: null,
    procesadoEn: null,
    creadoEn: "2026-05-26T14:15:00.000Z"
  }
];

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

const mockGetPendingJustificaciones = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10 } = params;
      const pendingList = mockJustificaciones.filter(j => j.estadoSolicitud === 'PENDIENTE');
      const totalElements = pendingList.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const content = pendingList.slice(start, start + size);
      
      resolve({
        content,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages
      });
    }, 450);
  });
};

const mockApproveJustificacion = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockJustificaciones.findIndex(j => j.id === id);
      if (idx === -1) return reject(new Error('Justificación no encontrada'));
      
      const updated = {
        ...mockJustificaciones[idx],
        estadoSolicitud: 'APROBADO',
        comentariosAdministrador: data.comentariosAdministrador || 'Aprobado por el Administrador.',
        procesadoEn: new Date().toISOString()
      };
      
      mockJustificaciones[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockRejectJustificacion = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockJustificaciones.findIndex(j => j.id === id);
      if (idx === -1) return reject(new Error('Justificación no encontrada'));
      
      const updated = {
        ...mockJustificaciones[idx],
        estadoSolicitud: 'RECHAZADO',
        comentariosAdministrador: data.comentariosAdministrador || 'Rechazado por el Administrador.',
        procesadoEn: new Date().toISOString()
      };
      
      mockJustificaciones[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockCreateJustificacion = (data, empleadoNombre = 'Empleado Test') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newJust = {
        id: crypto.randomUUID(),
        registroAsistenciaId: data.registroAsistenciaId,
        empleadoId: data.empleadoId || "7ac159a4-28b9-4672-911e-b8d438fc7bfd",
        empleadoNombre: empleadoNombre,
        fecha: new Date().toISOString().split('T')[0],
        motivoEmpleado: data.motivoEmpleado,
        urlComprobanteS3: data.urlComprobanteS3,
        estadoSolicitud: 'PENDIENTE',
        comentariosAdministrador: null,
        procesadoEn: null,
        creadoEn: new Date().toISOString()
      };
      mockJustificaciones.unshift(newJust);
      resolve(newJust);
    }, 450);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

export const getPendingJustificaciones = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/justificaciones/pendientes', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetPendingJustificaciones(params);
    }
    throw error;
  }
};

export const approveJustificacion = async (id, comments = '') => {
  try {
    const response = await api.put(`/api/v1/admin/justificaciones/${id}/aprobar`, {
      comentariosAdministrador: comments
    });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockApproveJustificacion(id, { comentariosAdministrador: comments });
    }
    throw error;
  }
};

export const rejectJustificacion = async (id, comments = '') => {
  try {
    const response = await api.put(`/api/v1/admin/justificaciones/${id}/rechazar`, {
      comentariosAdministrador: comments
    });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockRejectJustificacion(id, { comentariosAdministrador: comments });
    }
    throw error;
  }
};

export const createJustificacion = async (data, empleadoNombre = 'Empleado Test') => {
  try {
    const response = await api.post('/api/v1/admin/justificaciones', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCreateJustificacion(data, empleadoNombre);
    }
    throw error;
  }
};
