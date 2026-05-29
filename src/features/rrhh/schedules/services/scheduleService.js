import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA ---
let mockRules = [
  { id: "c138d82f-2d7c-473d-9be2-4411fb16a1b2", empresaId: "0757d941-2038-4abc-a0e3-fd1eaffd4bf3", descripcion: "Jornada Administrativa General", horaEntradaOficial: "08:00:00", horaSalidaOficial: "17:00:00", minutosToleranciaRetardo: 15, tiempoLimiteFaltaMinutos: 120 },
  { id: "c138d82f-2d7c-473d-9be2-4411fb16a1b3", empresaId: "0757d941-2038-4abc-a0e3-fd1eaffd4bf3", descripcion: "Jornada Nocturna Operativa", horaEntradaOficial: "22:00:00", horaSalidaOficial: "06:00:00", minutosToleranciaRetardo: 10, tiempoLimiteFaltaMinutos: 60 }
];

let mockSurcharges = {
  id: "e67b2d5a-19df-4e2a-89a1-7786dfaf15bb",
  factorHoraExtraDiurna: 1.25,
  factorHoraExtraNocturna: 1.75,
  factorHoraDominicalFestiva: 2.00,
  multaRetardoPorMinuto: 500.00
};

// --- TRADUCCIÓN DE ENVELOPE Y NOMENCLATURA ---

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// Mapear regla de horario (snake_case del back -> camelCase del front)
const mapRuleToCamel = (rule) => {
  if (!rule) return null;
  return {
    id: rule.id,
    empresaId: rule.empresa_id || rule.empresaId,
    descripcion: rule.descripcion,
    horaEntradaOficial: rule.hora_entrada_oficial || rule.horaEntradaOficial,
    horaSalidaOficial: rule.hora_salida_oficial || rule.horaSalidaOficial,
    minutosToleranciaRetardo: rule.minutos_tolerancia_retardo !== undefined ? rule.minutos_tolerancia_retardo : rule.minutosToleranciaRetardo,
    tiempoLimiteFaltaMinutos: rule.tiempo_limite_falta_minutos !== undefined ? rule.tiempo_limite_falta_minutos : rule.tiempoLimiteFaltaMinutos
  };
};

// Mapear recargos (snake_case del back -> camelCase del front)
const mapSurchargesToCamel = (s) => {
  if (!s) return null;
  return {
    id: s.id,
    factorHoraExtraDiurna: s.factor_hora_extra_diurna !== undefined ? s.factor_hora_extra_diurna : s.factorHoraExtraDiurna,
    factorHoraExtraNocturna: s.factor_hora_extra_nocturna !== undefined ? s.factor_hora_extra_nocturna : s.factorHoraExtraNocturna,
    factorHoraDominicalFestiva: s.factor_hora_dominical_festiva !== undefined ? s.factor_hora_dominical_festiva : s.factorHoraDominicalFestiva,
    multaRetardoPorMinuto: s.multa_retardo_por_minuto !== undefined ? s.multa_retardo_por_minuto : s.multaRetardoPorMinuto
  };
};

// --- MOCK API ACTIONS ---

const mockGetRulesPaginated = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10 } = params;
      const totalElements = mockRules.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      resolve({
        content: mockRules.slice(start, start + size),
        pageNumber: page,
        pageSize: size,
        totalElements,
        totalPages
      });
    }, 450);
  });
};

const mockCreateRule = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newRule = {
        id: crypto.randomUUID(),
        empresaId: data.empresaId || "0757d941-2038-4abc-a0e3-fd1eaffd4bf3",
        descripcion: data.descripcion,
        horaEntradaOficial: data.horaEntradaOficial,
        horaSalidaOficial: data.horaSalidaOficial,
        minutosToleranciaRetardo: Number(data.minutosToleranciaRetardo) || 0,
        tiempoLimiteFaltaMinutos: Number(data.tiempoLimiteFaltaMinutos) || 120
      };
      mockRules.push(newRule);
      resolve(newRule);
    }, 400);
  });
};

const mockUpdateRule = (id, data) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockRules.findIndex(r => r.id === id);
      if (idx === -1) return reject(new Error('Rule not found'));
      const updated = {
        ...mockRules[idx],
        descripcion: data.descripcion,
        horaEntradaOficial: data.horaEntradaOficial,
        horaSalidaOficial: data.horaSalidaOficial,
        minutosToleranciaRetardo: Number(data.minutosToleranciaRetardo),
        tiempoLimiteFaltaMinutos: Number(data.tiempoLimiteFaltaMinutos)
      };
      mockRules[idx] = updated;
      resolve(updated);
    }, 400);
  });
};

const mockDeleteRule = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = mockRules.findIndex(r => r.id === id);
      if (idx === -1) return reject(new Error('Rule not found'));
      mockRules.splice(idx, 1);
      resolve();
    }, 350);
  });
};

// --- REAL API CALLS WITH FALLBACK ---

// REGLAS HORARIO
export const getScheduleRules = async () => {
  try {
    const response = await api.get('/api/v1/admin/reglas-horario');
    const data = handleResponse(response);
    return Array.isArray(data) ? data.map(mapRuleToCamel) : [];
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return mockRules.map(mapRuleToCamel);
    }
    throw error;
  }
};

export const getScheduleRulesPaginated = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/reglas-horario/paginated', { params });
    const data = handleResponse(response);
    return {
      ...data,
      content: Array.isArray(data?.content) ? data.content.map(mapRuleToCamel) : []
    };
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      const res = await mockGetRulesPaginated(params);
      return {
        ...res,
        content: res.content.map(mapRuleToCamel)
      };
    }
    throw error;
  }
};

export const createScheduleRule = async (data) => {
  try {
    // Se envía en camelCase según contrato
    const response = await api.post('/api/v1/admin/reglas-horario', data);
    return mapRuleToCamel(handleResponse(response));
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return mapRuleToCamel(await mockCreateRule(data));
    }
    throw error;
  }
};

export const updateScheduleRule = async (id, data) => {
  try {
    const response = await api.put(`/api/v1/admin/reglas-horario/${id}`, data);
    return mapRuleToCamel(handleResponse(response));
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return mapRuleToCamel(await mockUpdateRule(id, data));
    }
    throw error;
  }
};

export const deleteScheduleRule = async (id) => {
  try {
    await api.delete(`/api/v1/admin/reglas-horario/${id}`);
    return true;
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      await mockDeleteRule(id);
      return true;
    }
    throw error;
  }
};

// RECARGOS
export const getSurcharges = async () => {
  try {
    const response = await api.get('/api/v1/admin/recargos');
    return mapSurchargesToCamel(handleResponse(response));
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return mapSurchargesToCamel(mockSurcharges);
    }
    throw error;
  }
};

export const saveSurcharges = async (data, isUpdate = true) => {
  try {
    // Intenta enviar via POST (crear) o PUT (actualizar)
    // El contrato expone POST para crear y PUT para actualizar.
    const response = isUpdate 
      ? await api.put('/api/v1/admin/recargos', data)
      : await api.post('/api/v1/admin/recargos', data);
    return mapSurchargesToCamel(handleResponse(response));
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      mockSurcharges = {
        ...mockSurcharges,
        ...data,
        id: mockSurcharges.id || crypto.randomUUID()
      };
      return mapSurchargesToCamel(mockSurcharges);
    }
    throw error;
  }
};
