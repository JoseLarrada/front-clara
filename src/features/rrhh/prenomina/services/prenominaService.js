import api from '../../../../services/api';

// --- MOCK DATABASE EN MEMORIA ---
let mockHistoricalReports = [
  {
    id: "e67b2d5a-19df-4e2a-89a1-7786dfaf15bb",
    empresaId: "0757d941-2038-4abc-a0e3-fd1eaffd4bf3",
    empleadoId: "7ac159a4-28b9-4672-911e-b8d438fc7bfd", // Carlos Pérez González
    empleadoNombre: "Carlos Pérez González",
    mesPeriodo: 5,
    anioPeriodo: 2026,
    diasTrabajadosEfectivos: 20,
    diasFaltaInjustificada: 2,
    horasExtrasDiurnasTotales: 5.50,
    horasExtrasNocturnasTotales: 2.00,
    montoSalarioBaseProporcional: 1866666.67,
    montoGananciaExtras: 125000.00,
    montoDeduccionesFaltas: 133333.33,
    montoNetoPagar: 1858333.34,
    estadoReporte: "BORRADOR",
    requiereRecalculo: true, // Bandera de inconsistencia para pruebas
    generadoEl: "2026-05-28T04:37:00.000Z"
  }
];

// Datos salariales base simulados de los empleados (para calcular simulación dinámica)
const employeeSalaryData = {
  "7ac159a4-28b9-4672-911e-b8d438fc7bfd": { nombre: "Carlos Pérez González", base: 2000000, contrato: "TERMINO_INDEFINIDO" },
  "7ac159a4-28b9-4672-911e-b8d438fc7bfe": { nombre: "Ana María Silva", base: 2500000, contrato: "TERMINO_INDEFINIDO" },
  "7ac159a4-28b9-4672-911e-b8d438fc7bff": { nombre: "Diego Alejandro Ruiz", base: 3200000, contrato: "TERMINO_INDEFINIDO" },
  "7ac159a4-28b9-4672-911e-b8d438fc7bg1": { nombre: "Mariana Torres", base: 1800000, contrato: "TERMINO_INDEFINIDO" }
};

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

// --- MOCK API ACTIONS ---

// Simulación dinámica de cálculos salariales en caliente
const mockCalculateConsolidado = (empleadoId, fechaInicio, fechaFin) => {
  // Calculamos los días del periodo
  const start = new Date(fechaInicio);
  const end = new Date(fechaFin);
  const diffDays = Math.ceil((end - start) / (1000 * 3600 * 24)) + 1;
  const mes = start.getMonth() + 1;
  const anio = start.getFullYear();

  const calculateForOne = (empId) => {
    const data = employeeSalaryData[empId] || { nombre: "Empleado Test", base: 1500000, contrato: "TERMINO_INDEFINIDO" };
    
    // Simular incidencias ficticias en base al ID para consistencia en pruebas
    const lastChar = empId.substring(empId.length - 1);
    const code = lastChar.charCodeAt(0);
    
    const diasFalta = code % 3 === 0 ? 1 : (code % 5 === 0 ? 2 : 0);
    const llegadasTardias = code % 2 === 0 ? 3 : 0;
    const extrasDiurnas = code % 2 === 0 ? 4.5 : 0;
    const extrasNocturnas = code % 3 === 0 ? 2.0 : 0;
    
    const diasTrabajados = Math.max(0, diffDays - diasFalta);
    
    // Cálculos matemáticos
    const valorDia = data.base / 30;
    const valorHora = valorDia / 8;
    
    const montoSalarioBaseProporcional = Number((valorDia * Math.min(30, diasTrabajados)).toFixed(2));
    const montoGananciaExtras = Number(((extrasDiurnas * valorHora * 1.25) + (extrasNocturnas * valorHora * 1.75)).toFixed(2));
    const montoDeduccionesFaltas = Number((diasFalta * valorDia + llegadasTardias * (valorHora / 4)).toFixed(2)); // penalización por retardo
    const montoNetoPagar = Number((montoSalarioBaseProporcional + montoGananciaExtras - montoDeduccionesFaltas).toFixed(2));
    
    return {
      empleadoId: empId,
      empleadoNombre: data.nombre,
      tipoContrato: data.contrato,
      tipoMoneda: "COP",
      mesPeriodo: mes,
      anioPeriodo: anio,
      fechaInicio,
      fechaFin,
      diasTrabajadosEfectivos: diasTrabajados,
      diasFaltaInjustificada: diasFalta,
      diasVacacionesAprobadas: 0,
      llegadasTardias,
      horasTrabajadasTotales: diasTrabajados * 8,
      horasExtrasDiurnasTotales: extrasDiurnas,
      horasExtrasNocturnasTotales: extrasNocturnas,
      montoSalarioBaseProporcional,
      montoGananciaExtras,
      montoDeduccionesFaltas,
      montoNetoPagar
    };
  };

  if (empleadoId) {
    return [calculateForOne(empleadoId)];
  } else {
    return Object.keys(employeeSalaryData).map(id => calculateForOne(id));
  }
};

const mockGetConsolidado = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { empleadoId, fechaInicio = "2026-05-01", fechaFin = "2026-05-30" } = params;
      const res = mockCalculateConsolidado(empleadoId, fechaInicio, fechaFin);
      resolve(res);
    }, 450);
  });
};

const mockGenerateReports = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const consolidado = mockCalculateConsolidado(data.empleadoId, data.fechaInicio, data.fechaFin);
      const generated = consolidado.map(c => {
        const rep = {
          id: crypto.randomUUID(),
          empresaId: "0757d941-2038-4abc-a0e3-fd1eaffd4bf3",
          empleadoId: c.empleadoId,
          empleadoNombre: c.empleadoNombre,
          mesPeriodo: c.mesPeriodo,
          anioPeriodo: c.anioPeriodo,
          diasTrabajadosEfectivos: c.diasTrabajadosEfectivos,
          diasFaltaInjustificada: c.diasFaltaInjustificada,
          horasExtrasDiurnasTotales: c.horasExtrasDiurnasTotales,
          horasExtrasNocturnasTotales: c.horasExtrasNocturnasTotales,
          montoSalarioBaseProporcional: c.montoSalarioBaseProporcional,
          montoGananciaExtras: c.montoGananciaExtras,
          montoDeduccionesFaltas: c.montoDeduccionesFaltas,
          montoNetoPagar: c.montoNetoPagar,
          estadoReporte: "BORRADOR",
          generadoEl: new Date().toISOString()
        };
        mockHistoricalReports.unshift(rep);
        return rep;
      });
      resolve(generated);
    }, 500);
  });
};

const mockGetReports = (params) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const { page = 0, size = 10, empleadoId, estadoReporte } = params;
      let filtered = [...mockHistoricalReports];
      
      if (empleadoId) {
        filtered = filtered.filter(r => r.empleadoId === empleadoId);
      }
      if (estadoReporte) {
        filtered = filtered.filter(r => r.estadoReporte === estadoReporte);
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size);
      const start = page * size;
      const content = filtered.slice(start, start + size);
      
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

// --- REAL API CALLS WITH FALLBACK ---

export const getPrenominaConsolidado = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/reportes-prenomina/consolidado', { params });
    const data = handleResponse(response);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetConsolidado(params);
    }
    throw error;
  }
};

export const generatePrenomina = async (data) => {
  try {
    const response = await api.post('/api/v1/admin/reportes-prenomina/generar', data);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGenerateReports(data);
    }
    throw error;
  }
};

export const getPrenominaReports = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/reportes-prenomina', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return await mockGetReports(params);
    }
    throw error;
  }
};

export const getPrenominaReportById = async (id) => {
  try {
    const response = await api.get(`/api/v1/admin/reportes-prenomina/${id}`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      const rep = mockHistoricalReports.find(r => r.id === id);
      if (!rep) throw new Error('Reporte no encontrado');
      return rep;
    }
    throw error;
  }
};

export const recalcularPrenominaReport = async (id) => {
  try {
    const response = await api.post(`/api/v1/admin/reportes-prenomina/${id}/recalcular`);
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const report = mockHistoricalReports.find(r => r.id === id);
          if (report) {
            report.requiereRecalculo = false;
            report.requiere_recalculo = false;
            // Aumentar ligeramente el pago simulado para evidenciar que corrió el cálculo
            report.montoNetoPagar = Number((report.montoNetoPagar * 1.05).toFixed(2));
          }
          resolve({ success: true, message: 'Reporte recalculado con éxito (Simulado)' });
        }, 500);
      });
    }
    throw error;
  }
};

// Download exporter files
export const exportReport = async (type, params) => {
  try {
    const response = await api.get(`/api/v1/admin/reportes-prenomina/export/${type}`, {
      params,
      responseType: 'blob'
    });
    const blob = new Blob([response.data], { type: response.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pre-nomina-report.${type}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    // Fallback: Si no hay red, simulamos una descarga generando un archivo ficticio local en cliente
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Network offline, triggering mock download file creation...');
      const consolidado = mockCalculateConsolidado(params.empleadoId, params.fechaInicio || "2026-05-01", params.fechaFin || "2026-05-30");
      let content = '';
      let filename = `pre-nomina-consolidada.${type === 'excel' ? 'xlsx' : type === 'pdf' ? 'pdf' : 'csv'}`;
      let contentType = 'text/plain';

      if (type === 'csv') {
        contentType = 'text/csv;charset=utf-8;';
        content = "Empleado,DiasTrabajados,Faltas,ExtrasDiurnas,ExtrasNocturnas,SalarioBase,GananciaExtras,Deducciones,NetoPagar\n";
        consolidado.forEach(c => {
          content += `${c.empleadoNombre},${c.diasTrabajadosEfectivos},${c.diasFaltaInjustificada},${c.horasExtrasDiurnasTotales},${c.horasExtrasNocturnasTotales},${c.montoSalarioBaseProporcional},${c.montoGananciaExtras},${c.montoDeduccionesFaltas},${c.montoNetoPagar}\n`;
        });
      } else {
        contentType = 'application/octet-stream';
        content = `Simulated pre-payroll report in format ${type.toUpperCase()}\nDate: ${params.fechaInicio} to ${params.fechaFin}\n` + JSON.stringify(consolidado, null, 2);
      }

      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return true;
    }
    throw error;
  }
};
