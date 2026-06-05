import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockEmployees = [
  { id: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", nombreCompleto: "Carlos Pérez González", email: "carlos.perez@empresa.com", rol: "EMPLEADO", modalidadPerfil: "HIBRIDO", fotoPatronUrl: "https://s3.amazonaws.com/cloudtime-buckets/comprobantes/carlos_patron.jpg", saldoVacaciones: 15, activo: true, creadoEn: "2026-05-28T04:30:00.000Z" },
  { id: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", nombreCompleto: "Ana María Silva", email: "ana.silva@empresa.com", rol: "EMPLEADO", modalidadPerfil: "PRESENCIAL", fotoPatronUrl: "", saldoVacaciones: 12, activo: true, creadoEn: "2026-04-10T12:00:00.000Z" },
  { id: "7ac159a4-28b9-4672-911e-b8d438fc7bff", nombreCompleto: "Diego Alejandro Ruiz", email: "diego.ruiz@empresa.com", rol: "ADMIN_RRHH", modalidadPerfil: "REMOTO", fotoPatronUrl: "", saldoVacaciones: 18, activo: true, creadoEn: "2026-03-15T09:45:00.000Z" },
  { id: "7ac159a4-28b9-4672-911e-b8d438fc7bg1", nombreCompleto: "Mariana Torres", email: "mariana.torres@empresa.com", rol: "EMPLEADO", modalidadPerfil: "HIBRIDO", fotoPatronUrl: "", saldoVacaciones: 10, activo: false, creadoEn: "2026-05-01T08:00:00.000Z" }
];

// --- MOCK API ACTIONS ---

const mockGetEmployees = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10, sort = 'creadoEn,desc' } = params;
      
      let list = [...mockEmployees];
      
      // Ordenamiento
      const [field, direction] = sort.split(',');
      list.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        if (typeof valA === 'string') {
          return direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        } else {
          return direction === 'asc' ? valA - valB : valB - valA;
        }
      });
      
      const totalElements = list.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const content = list.slice(start, start + size);
      
      resolve({
        content,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages
      });
    }, 500);
  });
};

const mockCreateEmployee = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validar duplicado de correo
      const emailExists = mockEmployees.some(e => e.email.toLowerCase() === data.email.toLowerCase());
      if (emailExists) {
        const err = new Error('Conflict');
        err.response = {
          status: 409,
          data: {
            message: `Ya existe un registro con el email proporcionado: ${data.email}`
          }
        };
        return reject(err);
      }

      const newEmp = {
        id: crypto.randomUUID(),
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        rol: data.rol || 'EMPLEADO',
        modalidadPerfil: data.modalidadPerfil || 'HIBRIDO',
        fotoPatronUrl: data.fotoPatronUrl || '',
        saldoVacaciones: Number(data.saldoVacaciones) || 15,
        activo: data.activo !== undefined ? data.activo : true,
        creadoEn: new Date().toISOString()
      };
      
      mockEmployees.unshift(newEmp);
      resolve(newEmp);
    }, 500);
  });
};

const mockUpdateEmployee = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Empleado no encontrado' } };
        return reject(err);
      }

      // Validar duplicado de correo con otros
      const emailExists = mockEmployees.some(e => e.id !== id && e.email.toLowerCase() === data.email.toLowerCase());
      if (emailExists) {
        const err = new Error('Conflict');
        err.response = {
          status: 409,
          data: {
            message: `Ya existe un registro con el email proporcionado: ${data.email}`
          }
        };
        return reject(err);
      }

      const updated = {
        ...mockEmployees[index],
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        rol: data.rol,
        modalidadPerfil: data.modalidadPerfil,
        saldoVacaciones: Number(data.saldoVacaciones),
        activo: data.activo
      };
      
      mockEmployees[index] = updated;
      resolve(updated);
    }, 500);
  });
};

const mockDeleteEmployee = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Empleado no encontrado' } };
        return reject(err);
      }
      mockEmployees.splice(index, 1);
      resolve();
    }, 400);
  });
};

const mockPatchFotoPatron = (id, url) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        return reject(err);
      }
      mockEmployees[index].fotoPatronUrl = url;
      resolve(mockEmployees[index]);
    }, 400);
  });
};

const mockPatchModalidad = (id, modalidad) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        return reject(err);
      }
      mockEmployees[index].modalidadPerfil = modalidad;
      resolve(mockEmployees[index]);
    }, 400);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

export const getEmployees = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/empleados', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetEmployees(params);
    }
    throw error;
  }
};

export const createEmployee = async (data) => {
  try {
    const response = await api.post('/api/v1/admin/empleados', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCreateEmployee(data);
    }
    throw error;
  }
};

export const updateEmployee = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/admin/empleados/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockUpdateEmployee(id, data);
    }
    throw error;
  }
};

export const deleteEmployee = async (id) => {
  try {
    await api.delete(`/api/v1/admin/empleados/${id}`);
    return true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockDeleteEmployee(id);
      return true;
    }
    throw error;
  }
};

export const patchFotoPatron = async (id, fotoPatronUrl) => {
  try {
    const response = await api.patch(`/api/v1/admin/empleados/${id}/foto-patron`, { fotoPatronUrl });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockPatchFotoPatron(id, fotoPatronUrl);
    }
    throw error;
  }
};

export const patchModalidad = async (id, modalidadPerfil) => {
  try {
    const response = await api.patch(`/api/v1/admin/empleados/${id}/modalidad`, { modalidadPerfil });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockPatchModalidad(id, modalidadPerfil);
    }
    throw error;
  }
};

// --- EMPLOYEE PANEL PORTAL CALLS ---

const mockGetMiContrato = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: "mi-contrato-id-12345",
        empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bff",
        empleadoNombre: "Colaborador Autenticado",
        salarioBaseMensual: 3200000,
        tipoMoneda: "COP",
        tipoContrato: "TERMINO_INDEFINIDO",
        fechaIngreso: "2026-06-05",
        fechaRetiro: null,
        activo: true
      });
    }, 400);
  });
};

const mockGetMisReportesPrenomina = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10 } = params;
      resolve({
        content: [
          {
            id: "prenomina-autenticado-1",
            empresaId: "empresa-12345",
            empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bff",
            empleadoNombre: "Colaborador Autenticado",
            mesPeriodo: 5,
            anioPeriodo: 2026,
            diasTrabajadosEfectivos: 22,
            diasFaltaInjustificada: 0,
            horasExtrasDiurnasTotales: 4.5,
            horasExtrasNocturnasTotales: 1.0,
            montoSalarioBaseProporcional: 3200000,
            montoGananciaExtras: 120000,
            montoDeduccionesFaltas: 0,
            montoNetoPagar: 3320000,
            estadoReporte: "PROCESADO_PAGO",
            requiereRecalculo: false,
            generadoEl: "2026-06-05T01:50:27.399Z"
          }
        ],
        pageNumber: page,
        pageSize: size,
        totalElements: 1,
        totalPages: 1
      });
    }, 450);
  });
};

export const getMiContrato = async () => {
  try {
    const response = await api.get('/api/v1/empleado/panel/contrato');
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetMiContrato();
    }
    throw error;
  }
};

export const getMisReportesPrenomina = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/empleado/panel/reportes-prenomina', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetMisReportesPrenomina(params);
    }
    throw error;
  }
};

