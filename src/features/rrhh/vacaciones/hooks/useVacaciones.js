import { useState, useEffect, useCallback } from 'react';
import { getEmployees } from '../../employees/services/employeeService';
import {
  getPendingVacaciones,
  approveVacacion,
  rejectVacacion,
  createVacacion,
  getSaldoVacaciones
} from '../services/vacacionesService';

export const useVacaciones = () => {
  const [vacaciones, setVacaciones] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  
  const [loading, setLoading] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Consulta de Saldo
  const [balanceCheckEmployeeId, setBalanceCheckEmployeeId] = useState('');
  const [checkedBalance, setCheckedBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch pending vacation requests
  const fetchPending = useCallback(async () => {
    setLoading(true);
    setApiError('');
    try {
      const res = await getPendingVacaciones({
        page: pagination.page,
        size: pagination.size,
        sort: 'creadoEn,desc'
      });
      setVacaciones(res.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching pending vacations:', err);
      setApiError('No se pudieron cargar las solicitudes de vacaciones pendientes.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  // Fetch employees list
  const fetchEmployeesList = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees({ size: 100, sort: 'nombreCompleto,asc' });
      const list = res?.content || res || [];
      const activeList = list.filter(e => e.activo);
      setEmployees(activeList);
      
      if (activeList.length > 0) {
        setBalanceCheckEmployeeId(activeList[0].id);
      }
    } catch (err) {
      console.error('Error fetching employees for vacations:', err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
    fetchEmployeesList();
  }, [fetchPending, fetchEmployeesList]);

  // Fetch balance when selected employee changes in checking widget
  const fetchEmployeeBalance = useCallback(async () => {
    if (!balanceCheckEmployeeId) {
      setCheckedBalance(null);
      return;
    }
    setLoadingBalance(true);
    try {
      const res = await getSaldoVacaciones(balanceCheckEmployeeId);
      // Intentar obtener el saldo
      setCheckedBalance(res.saldoVacaciones !== undefined ? res.saldoVacaciones : 15);
    } catch (err) {
      console.error('Error checking employee balance:', err);
      setCheckedBalance(15); // fallback por defecto
    } finally {
      setLoadingBalance(false);
    }
  }, [balanceCheckEmployeeId]);

  useEffect(() => {
    fetchEmployeeBalance();
  }, [fetchEmployeeBalance]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Approve Request
  const handleApproveVacacion = async (id) => {
    if (!window.confirm('¿Está seguro de que desea aprobar esta solicitud de vacaciones? Los días correspondientes se deducirán del saldo de vacaciones del colaborador.')) {
      return;
    }
    setActionLoading(true);
    setApiError('');
    try {
      await approveVacacion(id);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Actualizar listado de pendientes
      if (vacaciones.length === 1 && pagination.page > 0) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchPending();
      }
      
      // Actualizar saldo verificado por si es el mismo empleado
      await fetchEmployeeBalance();
    } catch (err) {
      console.error('Error approving vacations:', err);
      const msg = err.response?.data?.message || 'Error al aprobar la vacación.';
      setApiError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Request
  const handleRejectVacacion = async (id) => {
    if (!window.confirm('¿Está seguro de que desea rechazar esta solicitud de vacaciones? El saldo de vacaciones no sufrirá alteraciones.')) {
      return;
    }
    setActionLoading(true);
    setApiError('');
    try {
      await rejectVacacion(id);
      
      if (vacaciones.length === 1 && pagination.page > 0) {
        setPagination(prev => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchPending();
      }
    } catch (err) {
      console.error('Error rejecting vacations:', err);
      const msg = err.response?.data?.message || 'Error al rechazar la vacación.';
      setApiError(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Create Delegated Request (On behalf of employee)
  const handleCreateVacacion = async (formData) => {
    setActionLoading(true);
    setApiError('');
    try {
      const employeeObj = employees.find(e => e.id === formData.empleadoId);
      const name = employeeObj ? employeeObj.nombreCompleto : 'Empleado';
      
      await createVacacion({
        empleadoId: formData.empleadoId,
        fechaInicio: formData.fechaInicio,
        fechaFin: formData.fechaFin
      }, name);
      
      closeFormModal();
      setPagination(prev => ({ ...prev, page: 0 }));
      await fetchPending();
      await fetchEmployeeBalance(); // refrescar por si acaso
      return true;
    } catch (err) {
      console.error('Error creating vacation booking:', err);
      const msg = err.response?.data?.message || 'Error al solicitar las vacaciones. Compruebe los límites de saldo.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
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
    vacaciones,
    employees,
    pagination,
    loading,
    loadingEmployees,
    actionLoading,
    apiError,
    success,
    balanceCheckEmployeeId,
    setBalanceCheckEmployeeId,
    checkedBalance,
    loadingBalance,
    isFormModalOpen,
    handlePageChange,
    handleApproveVacacion,
    handleRejectVacacion,
    handleCreateVacacion,
    openFormModal,
    closeFormModal,
    refetch: fetchPending
  };
};
