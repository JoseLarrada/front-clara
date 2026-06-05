import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockContratos = [
  {
    id: "c1111111-2222-3333-4444-555555555555",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    empleadoNombre: "Carlos Pérez González",
    salarioBaseMensual: 2000000,
    tipoMoneda: "COP",
    tipoContrato: "TERMINO_INDEFINIDO",
    fechaIngreso: "2026-01-01",
    fechaRetiro: null,
    activo: true
  },
  {
    id: "c2222222-2222-3333-4444-555555555555",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", // Ana María Silva
    empleadoNombre: "Ana María Silva",
    salarioBaseMensual: 2500000,
    tipoMoneda: "COP",
    tipoContrato: "TERMINO_FIJO",
    fechaIngreso: "2025-06-01",
    fechaRetiro: "2026-06-01",
    activo: true
  },
  {
    id: "c3333333-2222-3333-4444-555555555555",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bff", // Diego Alejandro Ruiz
    empleadoNombre: "Diego Alejandro Ruiz",
    salarioBaseMensual: 3200000,
    tipoMoneda: "COP",
    tipoContrato: "TERMINO_INDEFINIDO",
    fechaIngreso: "2024-03-15",
    fechaRetiro: null,
    activo: true
  },
  {
    id: "c4444444-2222-3333-4444-555555555555",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bg1", // Mariana Torres
    empleadoNombre: "Mariana Torres",
    salarioBaseMensual: 1800000,
    tipoMoneda: "COP",
    tipoContrato: "PRESTACION_SERVICIOS",
    fechaIngreso: "2025-01-01",
    fechaRetiro: "2026-05-01",
    activo: false
  }
];

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

const mockGetContratosByEmpleado = (empleadoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const list = mockContratos.filter(c => c.empleadoId === empleadoId);
      resolve(list);
    }, 350);
  });
};

const mockCrearContrato = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Regla: No puede haber más de un contrato activo a la vez para el mismo empleado
      const hasActive = mockContratos.some(c => c.empleadoId === data.empleadoId && c.activo === true);
      if (data.activo && hasActive) {
        const err = new Error('Conflict');
        err.response = {
          status: 409,
          data: {
            message: "El empleado ya posee un contrato laboral activo actualmente. Debe cerrarlo primero."
          }
        };
        return reject(err);
      }

      const newContrato = {
        id: crypto.randomUUID(),
        empleadoId: data.empleadoId,
        empleadoNombre: data.empleadoNombre || "Empleado",
        salarioBaseMensual: Number(data.salarioBaseMensual),
        tipoMoneda: data.tipoMoneda,
        tipoContrato: data.tipoContrato,
        fechaIngreso: data.fechaIngreso,
        fechaRetiro: data.fechaRetiro || null,
        activo: data.activo !== undefined ? data.activo : true
      };

      mockContratos.unshift(newContrato);
      resolve(newContrato);
    }, 400);
  });
};

const mockActualizarContrato = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockContratos.findIndex(c => c.id === id);
      if (idx === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Contrato no encontrado' } };
        return reject(err);
      }

      const updated = {
        ...mockContratos[idx],
        salarioBaseMensual: Number(data.salarioBaseMensual),
        tipoMoneda: data.tipoMoneda,
        tipoContrato: data.tipoContrato,
        fechaIngreso: data.fechaIngreso,
        fechaRetiro: data.fechaRetiro || null,
        activo: data.activo
      };

      mockContratos[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockCerrarContrato = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockContratos.findIndex(c => c.id === id);
      if (idx === -1) {
        const err = new Error('Not Found');
        return reject(err);
      }

      const updated = {
        ...mockContratos[idx],
        fechaRetiro: data.fechaRetiro,
        activo: false
      };

      mockContratos[idx] = updated;
      resolve(updated);
    }, 350);
  });
};

const mockExtenderContrato = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockContratos.findIndex(c => c.id === id);
      if (idx === -1) {
        const err = new Error('Not Found');
        return reject(err);
      }

      const updated = {
        ...mockContratos[idx],
        fechaRetiro: data.nuevaFechaRetiro,
        salarioBaseMensual: data.nuevoSalarioBase ? Number(data.nuevoSalarioBase) : mockContratos[idx].salarioBaseMensual
      };

      mockContratos[idx] = updated;
      resolve(updated);
    }, 350);
  });
};

const mockEliminarContrato = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockContratos.findIndex(c => c.id === id);
      if (idx === -1) return reject(new Error('Not Found'));
      mockContratos.splice(idx, 1);
      resolve();
    }, 300);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

export const getContratosByEmpleado = async (empleadoId) => {
  try {
    const response = await api.get(`/api/v1/admin/contratos/empleado/${empleadoId}`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetContratosByEmpleado(empleadoId);
    }
    throw error;
  }
};

export const crearContrato = async (data) => {
  try {
    const response = await api.post('/api/v1/admin/contratos', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCrearContrato(data);
    }
    throw error;
  }
};

export const actualizarContrato = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/admin/contratos/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockActualizarContrato(id, data);
    }
    throw error;
  }
};

export const cerrarContrato = async (id, fechaRetiro) => {
  try {
    const response = await api.put(`/api/v1/admin/contratos/${id}/cerrar`, { fechaRetiro });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCerrarContrato(id, { fechaRetiro });
    }
    throw error;
  }
};

export const extenderContrato = async (id, nuevaFechaRetiro, nuevoSalarioBase) => {
  try {
    const response = await api.put(`/api/v1/admin/contratos/${id}/extender`, { nuevaFechaRetiro, nuevoSalarioBase });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockExtenderContrato(id, { nuevaFechaRetiro, nuevoSalarioBase });
    }
    throw error;
  }
};

export const eliminarContrato = async (id) => {
  try {
    await api.delete(`/api/v1/admin/contratos/${id}`);
    return true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockEliminarContrato(id);
      return true;
    }
    throw error;
  }
};
