import api from '../../../../services/api';

// --- MOCK AUDIT TRAIL DATABASE FOR OFFLINE DEVELOPMENT ---
let mockAuditLogs = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    usuarioNombre: "Jose Larrada (Admin)",
    rolUsuario: "ADMIN_RRHH",
    accion: "APROBAR_VACACIONES",
    tablaAfectada: "solicitudes_vacaciones",
    registroId: "fbc09d1e-829b-449e-b9b2-ea79038cf5a9",
    valorAnterior: { estado_solicitud: "PENDIENTE", dias_solicitados: 15 },
    valorNuevo: { estado_solicitud: "APROBADO", dias_solicitados: 15, movimiento_libro_id: "m1-vac-123" },
    direccionIp: "192.168.1.105",
    creadoEn: "2026-06-01T09:42:00.000Z"
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    usuarioNombre: "Jose Larrada (Admin)",
    rolUsuario: "ADMIN_RRHH",
    accion: "AJUSTE_SALDO_VACACIONES",
    tablaAfectada: "movimientos_vacaciones",
    registroId: "d6789abc-e012-3456-7890-abcdef012345",
    valorAnterior: null,
    valorNuevo: { empleado_id: "7ac159a4-28b9-4672-911e-b8d438fc7bfe", tipo_movimiento: "AJUSTE_ADMIN", cantidad_dias: 5, motivo_ajuste: "Ajuste por horas extras acumuladas" },
    direccionIp: "192.168.1.105",
    creadoEn: "2026-06-01T09:40:12.000Z"
  },
  {
    id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    usuarioNombre: "Jose Larrada (Admin)",
    rolUsuario: "ADMIN_RRHH",
    accion: "CREAR_GEOCERCA",
    tablaAfectada: "geocercas_remotas",
    registroId: "a0081d4d-c5fb-419b-9a73-63bc1ce4a7b2",
    valorAnterior: null,
    valorNuevo: { descripcion: "Casa de Campo", latitud: 4.6097, longitud: -74.0817, radio_tolerancia_metros: 60 },
    direccionIp: "186.29.130.42",
    creadoEn: "2026-05-31T20:15:30.000Z"
  },
  {
    id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
    usuarioNombre: "Jose Larrada (Admin)",
    rolUsuario: "ADMIN_RRHH",
    accion: "ACTUALIZAR_REGLAS_HORARIO",
    tablaAfectada: "reglas_negocio_horarios",
    registroId: "9c0d1e2f-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
    valorAnterior: { hora_entrada_oficial: "08:00:00", minutos_tolerancia_retardo: 10 },
    valorNuevo: { hora_entrada_oficial: "08:30:00", minutos_tolerancia_retardo: 15 },
    direccionIp: "192.168.1.105",
    creadoEn: "2026-05-30T15:20:00.000Z"
  },
  {
    id: "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
    usuarioNombre: "Sistemas (System)",
    rolUsuario: "SUPERADMIN",
    accion: "SUSPENDER_EMPRESA_CUOTA",
    tablaAfectada: "empresas",
    registroId: "0757d941-2038-4abc-a0e3-fd1eaffd4bf3",
    valorAnterior: { estado_licencia: "ACTIVO" },
    valorNuevo: { estado_licencia: "SUSPENDIDO", motivo_suspension: "Mantenimiento anual de facturación" },
    direccionIp: "127.0.0.1",
    creadoEn: "2026-05-29T11:00:00.000Z"
  }
];

const handleResponse = (response) => {
  if (response.data && typeof response.data === 'object' && 'success' in response.data) {
    return response.data.data;
  }
  return response.data;
};

export const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/api/v1/admin/auditoria/logs', { params });
    return handleResponse(response);
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const { page = 0, size = 10, accion = '', tablaAfectada = '' } = params;
          let filtered = [...mockAuditLogs];

          if (accion) {
            filtered = filtered.filter(l => l.accion.toLowerCase().includes(accion.toLowerCase()));
          }
          if (tablaAfectada) {
            filtered = filtered.filter(l => l.tablaAfectada.toLowerCase().includes(tablaAfectada.toLowerCase()));
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
        }, 400);
      });
    }
    throw error;
  }
};
