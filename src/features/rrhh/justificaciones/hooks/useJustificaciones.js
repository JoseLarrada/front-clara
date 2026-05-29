import { useState, useEffect, useCallback } from 'react';
import { getEmployees } from '../../employees/services/employeeService';
import {
  getPendingJustificaciones,
  approveJustificacion,
  rejectJustificacion,
  createJustificacion
} from '../services/justificacionService';

export const useJustificaciones = () => {
  const [justificaciones, setJustificaciones] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Modales
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedJustificacion, setSelectedJustificacion] = useState(null);
  const [actionType, setActionType] = useState('approve'); // 'approve' | 'reject'
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch pending justifications
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getPendingJustificaciones({
        page: pagination.page,
        size: pagination.size,
        sort: 'creadoEn,desc'
      });
      setJustificaciones(res.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching pending justifications:', err);
      setApiError('No se pudo cargar la lista de justificaciones pendientes.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  // Load employees for filing justifications
  const fetchEmployeesList = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees({ size: 100, sort: 'nombreCompleto,asc' });
      const list = res?.content || res || [];
      setEmployees(list.filter(e => e.activo));
    } catch (err) {
      console.error('Error fetching employees for justifications form:', err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  useEffect(() => {
    if (isFormModalOpen) {
      fetchEmployeesList();
    }
  }, [isFormModalOpen, fetchEmployeesList]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Approve/Reject Action
  const handleActionSubmit = async (comments) => {
    if (!selectedJustificacion) return false;
    setActionLoading(true);
    setApiError('');
    try {
      if (actionType === 'approve') {
        await approveJustificacion(selectedJustificacion.id, comments);
      } else {
        await rejectJustificacion(selectedJustificacion.id, comments);
      }
      
      closeActionModal();
      // Si la página queda vacía y no es la primera, retroceder una página
      if (justificaciones.length === 1 && pagination.page > 0) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchPending();
      }
      return true;
    } catch (err) {
      console.error('Error processing justification action:', err);
      const msg = err.response?.data?.message || 'Error al procesar la solicitud.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // Create Manual Justification (Filing incident)
  const handleCreateJustificacion = async (formData) => {
    setActionLoading(true);
    setApiError('');
    try {
      const employeeObj = employees.find(e => e.id === formData.empleadoId);
      const name = employeeObj ? employeeObj.nombreCompleto : 'Empleado';
      
      await createJustificacion({
        empleadoId: formData.empleadoId,
        registroAsistenciaId: formData.registroAsistenciaId,
        motivoEmpleado: formData.motivoEmpleado,
        urlComprobanteS3: formData.urlComprobanteS3
      }, name);
      
      closeFormModal();
      setPagination(prev => ({ ...prev, page: 0 })); // volver a pág 0 para ver el nuevo registro pendiente
      await fetchPending();
      return true;
    } catch (err) {
      console.error('Error creating justification:', err);
      const msg = err.response?.data?.message || 'Error al registrar la justificación.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (justificacion, type) => {
    setSelectedJustificacion(justificacion);
    setActionType(type);
    setApiError('');
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setSelectedJustificacion(null);
    setApiError('');
  };

  const openFormModal = () => {
    setApiError('');
    setIsFormModalOpen(true);
  };

  const closeFormModal = () => {
    setIsFormModalOpen(false);
    setApiError('');
  };

  return {
    justificaciones,
    employees,
    pagination,
    loading,
    loadingEmployees,
    actionLoading,
    apiError,
    isActionModalOpen,
    selectedJustificacion,
    actionType,
    isFormModalOpen,
    handlePageChange,
    handleActionSubmit,
    handleCreateJustificacion,
    openActionModal,
    closeActionModal,
    openFormModal,
    closeFormModal,
    refetch: fetchPending
  };
};
