import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockVacaciones = [
  {
    id: "fbc09d1e-829b-449e-b9b2-ea79038cf5a9",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    empleadoNombre: "Carlos Pérez González",
    fechaInicio: "2026-06-15",
    fechaFin: "2026-06-30",
    diasSolicitados: 15,
    estadoSolicitud: "PENDIENTE",
    saldoVacacionesAntes: 15,
    saldoVacacionesDespues: 0,
    creadoEn: "2026-05-28T04:36:00.000Z"
  }
];

// Saldos de prueba asociados a los mockEmployees de employeeService.js
let mockSaldos = {
  "7ac159a4-28b9-4672-911e-b8d438fc7bfd": 15, // Carlos
  "7ac159a4-28b9-4672-911e-b8d438fc7bfe": 12, // Ana
  "7ac159a4-28b9-4672-911e-b8d438fc7bff": 18, // Diego
  "7ac159a4-28b9-4672-911e-b8d438fc7bg1": 10  // Mariana
};

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

const mockGetPendingVacaciones = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10 } = params;
      const pendingList = mockVacaciones.filter(v => v.estadoSolicitud === 'PENDIENTE');
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

const mockApproveVacacion = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockVacaciones.findIndex(v => v.id === id);
      if (idx === -1) return reject(new Error('Solicitud no encontrada'));
      
      const req = mockVacaciones[idx];
      const updated = {
        ...req,
        estadoSolicitud: 'APROBADO'
      };
      
      // Descontar saldo real en el mock
      const empId = req.empleadoId;
      if (mockSaldos[empId] !== undefined) {
        mockSaldos[empId] = Math.max(0, mockSaldos[empId] - req.diasSolicitados);
      }
      
      mockVacaciones[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockRejectVacacion = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockVacaciones.findIndex(v => v.id === id);
      if (idx === -1) return reject(new Error('Solicitud no encontrada'));
      
      const updated = {
        ...mockVacaciones[idx],
        estadoSolicitud: 'RECHAZADO'
      };
      
      mockVacaciones[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockCreateVacacion = (data, empleadoNombre = 'Empleado Test') => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Calcular diferencia en días hábiles (aproximación simple)
      const start = new Date(data.fechaInicio);
      const end = new Date(data.fechaFin);
      const timeDiff = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // inclusivo

      const empId = data.empleadoId;
      const saldoAnt = mockSaldos[empId] !== undefined ? mockSaldos[empId] : 15;
      const saldoDesp = Math.max(0, saldoAnt - diffDays);

      const newVac = {
        id: crypto.randomUUID(),
        empleadoId: empId,
        empleadoNombre: empleadoNombre,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        diasSolicitados: diffDays,
        estadoSolicitud: "PENDIENTE",
        saldoVacacionesAntes: saldoAnt,
        saldoVacacionesDespues: saldoDesp,
        creadoEn: new Date().toISOString()
      };

      mockVacaciones.unshift(newVac);
      resolve(newVac);
    }, 500);
  });
};

const mockGetSaldoVacaciones = (empleadoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const saldo = mockSaldos[empleadoId] !== undefined ? mockSaldos[empleadoId] : 15;
      resolve({
        empleadoId,
        empleadoNombre: "Colaborador Consultador",
        saldoVacaciones: saldo
      });
    }, 300);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

export const getPendingVacaciones = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/vacaciones/pendientes', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetPendingVacaciones(params);
    }
    throw error;
  }
};

export const approveVacacion = async (id) => {
  try {
    const response = await api.put(`/api/v1/admin/vacaciones/${id}/aprobar`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockApproveVacacion(id);
    }
    throw error;
  }
};

export const rejectVacacion = async (id) => {
  try {
    const response = await api.put(`/api/v1/admin/vacaciones/${id}/rechazar`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockRejectVacacion(id);
    }
    throw error;
  }
};

export const createVacacion = async (data, empleadoNombre = 'Empleado Test') => {
  try {
    const response = await api.post('/api/v1/admin/vacaciones', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCreateVacacion(data, empleadoNombre);
    }
    throw error;
  }
};

export const getSaldoVacaciones = async (empleadoId) => {
  try {
    const response = await api.get(`/api/v1/admin/vacaciones/saldo/${empleadoId}`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      const res = await mockGetSaldoVacaciones(empleadoId);
      // Mapear nombre del listado actual si es posible
      return res;
    }
    throw error;
  }
};
