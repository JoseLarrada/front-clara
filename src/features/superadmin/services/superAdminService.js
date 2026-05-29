import api from '../../../services/api';

// --- MOCK DATABASE (Persiste en memoria del cliente para pruebas sin servidor) ---
let mockEmpresas = [
  { id: "4f9e2d3a-1111-4abc-a0e3-fd1eaffd4bf3", nombre: "Fábrica Metalúrgica del Norte", nitRut: "901445882-3", rubro: "INDUSTRIAL", limiteEmpleados: 120, estadoLicencia: "ACTIVO", creadoEn: "2026-05-26T15:00:00Z", actualizadoEn: "2026-05-26T15:00:00Z" },
  { id: "4f9e2d3a-2222-4abc-a0e3-fd1eaffd4bf4", nombre: "Consultores Tecnológicos de México", nitRut: "800332115-4", rubro: "SERVICIOS", limiteEmpleados: 45, estadoLicencia: "ACTIVO", creadoEn: "2026-04-12T10:30:00Z", actualizadoEn: "2026-04-12T10:30:00Z" },
  { id: "4f9e2d3a-3333-4abc-a0e3-fd1eaffd4bf5", nombre: "Comercializadora Oxxo S.A.", nitRut: "700998877-K", rubro: "COMERCIO", limiteEmpleados: 500, estadoLicencia: "SUSPENDIDO", creadoEn: "2026-01-20T08:00:00Z", actualizadoEn: "2026-01-20T08:00:00Z" },
  { id: "4f9e2d3a-4444-4abc-a0e3-fd1eaffd4bf6", nombre: "Restaurantes del Bajío", nitRut: "601112223-8", rubro: "ALIMENTOS", limiteEmpleados: 80, estadoLicencia: "ACTIVO", creadoEn: "2026-03-01T12:00:00Z", actualizadoEn: "2026-03-01T12:00:00Z" },
  { id: "4f9e2d3a-5555-4abc-a0e3-fd1eaffd4bf7", nombre: "Transportes del Pacífico", nitRut: "502223334-1", rubro: "LOGISTICA", limiteEmpleados: 150, estadoLicencia: "ACTIVO", creadoEn: "2026-02-15T14:45:00Z", actualizadoEn: "2026-02-15T14:45:00Z" },
  { id: "4f9e2d3a-6666-4abc-a0e3-fd1eaffd4bf8", nombre: "Clínica Médica de Monterrey", nitRut: "403334445-2", rubro: "SALUD", limiteEmpleados: 200, estadoLicencia: "ACTIVO", creadoEn: "2026-05-10T09:15:00Z", actualizadoEn: "2026-05-10T09:15:00Z" }
];

// --- MOCK API ACTIONS ---

const mockGetDashboard = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const activas = mockEmpresas.filter(e => e.estadoLicencia === 'ACTIVO').length;
      const totalEmpleados = mockEmpresas.reduce((sum, e) => sum + e.limiteEmpleados, 0);
      resolve({
        totalEmpresasActivas: activas,
        totalEmpleadosGlobales: totalEmpleados
      });
    }, 500);
  });
};

const mockGetEmpresas = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { nombre, nitRut, rubro, estadoLicencia, page = 0, size = 10, sort = 'creadoEn,desc' } = params;
      
      let filtered = [...mockEmpresas];
      
      if (nombre) {
        filtered = filtered.filter(e => e.nombre.toLowerCase().includes(nombre.toLowerCase()));
      }
      if (nitRut) {
        filtered = filtered.filter(e => e.nitRut === nitRut);
      }
      if (rubro) {
        filtered = filtered.filter(e => e.rubro.toUpperCase() === rubro.toUpperCase());
      }
      if (estadoLicencia) {
        filtered = filtered.filter(e => e.estadoLicencia === estadoLicencia);
      }
      
      // Ordenamiento sencillo
      const [field, direction] = sort.split(',');
      filtered.sort((a, b) => {
        let valA = a[field];
        let valB = b[field];
        
        if (typeof valA === 'string') {
          return direction === 'asc' 
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        } else {
          return direction === 'asc' ? valA - valB : valB - valA;
        }
      });
      
      // Paginación
      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const paginatedContent = filtered.slice(start, start + size);
      
      resolve({
        content: paginatedContent,
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages
      });
    }, 600);
  });
};

const mockCreateEmpresa = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validar duplicado de NIT
      const nitExists = mockEmpresas.some(e => e.nitRut === data.nitRut);
      if (nitExists) {
        const err = new Error('Conflict');
        err.response = {
          status: 409,
          data: {
            message: `Ya existe una empresa con el NIT/RUT proporcionado: ${data.nitRut}`
          }
        };
        return reject(err);
      }
      
      const newEmpresa = {
        id: crypto.randomUUID(),
        nombre: data.nombre,
        nitRut: data.nitRut,
        rubro: data.rubro || 'INDUSTRIAL',
        limiteEmpleados: Number(data.limiteEmpleados) || 10,
        estadoLicencia: data.estadoLicencia || 'ACTIVO',
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString()
      };
      
      mockEmpresas.unshift(newEmpresa);
      resolve(newEmpresa);
    }, 500);
  });
};

const mockUpdateEmpresa = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmpresas.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Empresa no encontrada' } };
        return reject(err);
      }
      
      const updated = {
        ...mockEmpresas[index],
        nombre: data.nombre,
        rubro: data.rubro,
        limiteEmpleados: Number(data.limiteEmpleados),
        actualizadoEn: new Date().toISOString()
      };
      
      mockEmpresas[index] = updated;
      resolve(updated);
    }, 500);
  });
};

const mockPatchEstado = (id, estado) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmpresas.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Empresa no encontrada' } };
        return reject(err);
      }
      
      const updated = {
        ...mockEmpresas[index],
        estadoLicencia: estado,
        actualizadoEn: new Date().toISOString()
      };
      
      mockEmpresas[index] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockDeleteEmpresa = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockEmpresas.findIndex(e => e.id === id);
      if (index === -1) {
        const err = new Error('Not Found');
        err.response = { status: 404, data: { message: 'Empresa no encontrada' } };
        return reject(err);
      }
      
      mockEmpresas.splice(index, 1);
      resolve();
    }, 400);
  });
};

// --- REAL API CALLS WITH FALLBACKS ---

/**
 * Desenvuelve la respuesta estándar del backend si contiene la estructura { success, message, data }
 */
const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/v1/superadmin/empresas/dashboard');
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetDashboard();
    }
    throw error;
  }
};

export const getEmpresas = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/superadmin/empresas', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetEmpresas(params);
    }
    throw error;
  }
};

export const createEmpresa = async (data) => {
  try {
    const response = await api.post('/api/v1/superadmin/empresas', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCreateEmpresa(data);
    }
    throw error;
  }
};

export const updateEmpresa = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/superadmin/empresas/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockUpdateEmpresa(id, data);
    }
    throw error;
  }
};

export const updateEmpresaEstado = async (id, estado) => {
  try {
    const response = await api.patch(`/api/v1/superadmin/empresas/${id}/estado`, { estado });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockPatchEstado(id, estado);
    }
    throw error;
  }
};

export const deleteEmpresa = async (id) => {
  try {
    const response = await api.delete(`/api/v1/superadmin/empresas/${id}`);
    return handleResponse(response) || true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockDeleteEmpresa(id);
      return true;
    }
    throw error;
  }
};

const mockRegisterUser = (data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (data.email.toLowerCase().includes('duplicado') || data.email === 'admin@mail.com') {
        const err = new Error('Conflict');
        err.response = {
          status: 409,
          data: {
            message: `El correo electrónico ${data.email} ya está registrado en el sistema.`
          }
        };
        return reject(err);
      }
      resolve({
        id: crypto.randomUUID(),
        nombreCompleto: data.nombreCompleto,
        email: data.email,
        rol: data.rol,
        modalidadPerfil: data.modalidadPerfil,
        fotourl: data.fotourl,
        empresa_id: data.empresa_id,
        saldoVacaciones: data.saldoVacaciones,
        creadoEn: new Date().toISOString()
      });
    }, 600);
  });
};

export const registerUser = async (data) => {
  try {
    const response = await api.post('/api/v1/auth/register', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockRegisterUser(data);
    }
    throw error;
  }
};

