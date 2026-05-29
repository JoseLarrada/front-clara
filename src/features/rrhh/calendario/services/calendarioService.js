import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA PARA DESARROLLO OFFLINE ---
let mockCalendarAssignments = [
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3811",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    fecha: "2026-05-04",
    caracterDia: "PRESENCIAL"
  },
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3812",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos
    fecha: "2026-05-05",
    caracterDia: "REMOTO"
  },
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3813",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos
    fecha: "2026-05-06",
    caracterDia: "REMOTO"
  },
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3814",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos
    fecha: "2026-05-07",
    caracterDia: "PRESENCIAL"
  },
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3815",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", // Ana María Silva
    fecha: "2026-05-04",
    caracterDia: "REMOTO"
  },
  {
    id: "a9018bc3-0e8d-4bd9-9403-d6c1dfef3816",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", // Ana
    fecha: "2026-05-05",
    caracterDia: "PRESENCIAL"
  }
];

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

const mockGetCalendar = (empleadoId, desde, hasta) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let list = mockCalendarAssignments.filter(a => a.empleadoId === empleadoId);
      if (desde) {
        list = list.filter(a => a.fecha >= desde);
      }
      if (hasta) {
        list = list.filter(a => a.fecha <= hasta);
      }
      resolve(list);
    }, 400);
  });
};

const mockSaveDayAssignment = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Si ya existe asignación para esa fecha y empleado, sobreescribir o actualizar
      const idx = mockCalendarAssignments.findIndex(a => a.empleadoId === data.empleadoId && a.fecha === data.fecha);
      if (idx !== -1) {
        mockCalendarAssignments[idx].caracterDia = data.caracterDia;
        resolve(mockCalendarAssignments[idx]);
      } else {
        const newAssign = {
          id: crypto.randomUUID(),
          empleadoId: data.empleadoId,
          fecha: data.fecha,
          caracterDia: data.caracterDia
        };
        mockCalendarAssignments.push(newAssign);
        resolve(newAssign);
      }
    }, 350);
  });
};

const mockBulkSaveCalendar = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const empId = data.empleadoId;
      const results = [];
      data.asignaciones.forEach(asg => {
        const idx = mockCalendarAssignments.findIndex(a => a.empleadoId === empId && a.fecha === asg.fecha);
        if (idx !== -1) {
          mockCalendarAssignments[idx].caracterDia = asg.caracterDia;
          results.push(mockCalendarAssignments[idx]);
        } else {
          const newAsg = {
            id: crypto.randomUUID(),
            empleadoId: empId,
            fecha: asg.fecha,
            caracterDia: asg.caracterDia
          };
          mockCalendarAssignments.push(newAsg);
          results.push(newAsg);
        }
      });
      resolve(results);
    }, 500);
  });
};

const mockDeleteDayAssignment = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockCalendarAssignments.findIndex(a => a.id === id);
      if (idx === -1) return reject(new Error('Asignación no encontrada'));
      mockCalendarAssignments.splice(idx, 1);
      resolve();
    }, 300);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

export const getCalendarAssignments = async (empleadoId, desde = '', hasta = '') => {
  try {
    const params = { empleadoId };
    if (desde) params.desde = desde;
    if (hasta) params.hasta = hasta;
    const response = await api.get('/api/v1/admin/calendario-hibrido', { params });
    return handleResponse(response) || [];
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetCalendar(empleadoId, desde, hasta);
    }
    throw error;
  }
};

export const saveDayAssignment = async (data) => {
  try {
    const response = await api.post('/api/v1/admin/calendario-hibrido', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockSaveDayAssignment(data);
    }
    throw error;
  }
};

export const bulkSaveCalendar = async (data) => {
  try {
    const response = await api.put('/api/v1/admin/calendario-hibrido/lote', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockBulkSaveCalendar(data);
    }
    throw error;
  }
};

export const deleteDayAssignment = async (id) => {
  try {
    await api.delete(`/api/v1/admin/calendario-hibrido/${id}`);
    return true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockDeleteDayAssignment(id);
      return true;
    }
    throw error;
  }
};
