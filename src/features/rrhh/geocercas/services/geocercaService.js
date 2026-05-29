import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockGeocercas = [
  {
    id: "e67b2d5a-19df-4e2a-89a1-7786dfaf15bb",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    descripcion: "Casa Carlos - Chapinero Bogotá",
    latitud: 4.6486,
    longitud: -74.0621,
    radioToleranciaMetros: 150
  },
  {
    id: "e67b2d5a-19df-4e2a-89a1-7786dfaf15bc",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", // Ana María Silva
    descripcion: "Oficina Satélite Ana - Salitre Bogotá",
    latitud: 4.6534,
    longitud: -74.1085,
    radioToleranciaMetros: 200
  }
];

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

const mockGetGeocercas = (empleadoId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (empleadoId) {
        resolve(mockGeocercas.filter(g => g.empleadoId === empleadoId));
      } else {
        resolve([...mockGeocercas]);
      }
    }, 400);
  });
};

const mockCreateGeocerca = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newGeocerca = {
        id: crypto.randomUUID(),
        empleadoId: data.empleadoId,
        descripcion: data.descripcion,
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        radioToleranciaMetros: Number(data.radioToleranciaMetros)
      };
      mockGeocercas.push(newGeocerca);
      resolve(newGeocerca);
    }, 450);
  });
};

const mockUpdateGeocerca = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockGeocercas.findIndex(g => g.id === id);
      if (idx === -1) return reject(new Error('Geocerca no encontrada'));
      const updated = {
        ...mockGeocercas[idx],
        descripcion: data.descripcion,
        latitud: Number(data.latitud),
        longitud: Number(data.longitud),
        radioToleranciaMetros: Number(data.radioToleranciaMetros)
      };
      mockGeocercas[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockDeleteGeocerca = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockGeocercas.findIndex(g => g.id === id);
      if (idx === -1) return reject(new Error('Geocerca no encontrada'));
      mockGeocercas.splice(idx, 1);
      resolve();
    }, 350);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

export const getGeocercas = async (empleadoId = null) => {
  try {
    const params = empleadoId ? { empleadoId } : {};
    const response = await api.get('/api/v1/admin/geocercas', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetGeocercas(empleadoId);
    }
    throw error;
  }
};

export const createGeocerca = async (data) => {
  try {
    // Aislamiento implicito: el JWT ya contiene la empresa, por lo que no enviamos empresa_id / tenant_id
    const response = await api.post('/api/v1/admin/geocercas', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockCreateGeocerca(data);
    }
    throw error;
  }
};

export const updateGeocerca = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/admin/geocercas/${id}`, data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockUpdateGeocerca(id, data);
    }
    throw error;
  }
};

export const deleteGeocerca = async (id) => {
  try {
    await api.delete(`/api/v1/admin/geocercas/${id}`);
    return true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockDeleteGeocerca(id);
      return true;
    }
    throw error;
  }
};
