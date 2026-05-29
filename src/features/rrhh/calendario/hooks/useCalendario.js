import { useState, useEffect, useCallback } from 'react';
import { getEmployees } from '../../employees/services/employeeService';
import {
  getCalendarAssignments,
  saveDayAssignment,
  deleteDayAssignment,
  bulkSaveCalendar
} from '../services/calendarioService';

export const useCalendario = () => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(2026); // Usar año base del proyecto 2026
  const [currentMonth, setCurrentMonth] = useState(5);  // Mayo (1-indexed)

  const [employees, setEmployees] = useState([]);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
  const [assignments, setAssignments] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Load employees list
  const fetchEmployeesList = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees({ size: 100, sort: 'nombreCompleto,asc' });
      const list = res?.content || res || [];
      // Filtramos colaboradores activos y únicamente con modalidad HIBRIDO
      const activeHybridList = list.filter(e => e.activo && e.modalidadPerfil === 'HIBRIDO');
      setEmployees(activeHybridList);
      
      if (activeHybridList.length > 0) {
        setSelectedEmpleadoId(activeHybridList[0].id);
      } else {
        setSelectedEmpleadoId('');
      }
    } catch (err) {
      console.error('Error fetching employees for calendar:', err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch calendar assignments for current employee and month
  const fetchCalendar = useCallback(async () => {
    if (!selectedEmpleadoId) {
      setAssignments([]);
      return;
    }
    setLoadingAssignments(true);
    setApiError('');
    try {
      // Calcular desde/hasta en base al mes y año actual
      const mStr = String(currentMonth).padStart(2, '0');
      const desde = `${currentYear}-${mStr}-01`;
      const lastDay = new Date(currentYear, currentMonth, 0).getDate();
      const hasta = `${currentYear}-${mStr}-${String(lastDay).padStart(2, '0')}`;

      const data = await getCalendarAssignments(selectedEmpleadoId, desde, hasta);
      setAssignments(data || []);
    } catch (err) {
      console.error('Error loading calendar assignments:', err);
      setApiError('No se pudieron cargar las asignaciones de días del colaborador.');
    } finally {
      setLoadingAssignments(false);
    }
  }, [selectedEmpleadoId, currentYear, currentMonth]);

  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Cell Click: Sequential toggle of day status
  // SIN_ASIGNAR -> REMOTO -> PRESENCIAL -> SIN_ASIGNAR
  const handleToggleDay = async (dateStr) => {
    if (!selectedEmpleadoId) return;
    
    const existing = assignments.find(a => a.fecha === dateStr);
    
    setLoadingAssignments(true);
    setApiError('');
    try {
      if (!existing) {
        // Crear como REMOTO
        await saveDayAssignment({
          empleadoId: selectedEmpleadoId,
          fecha: dateStr,
          caracterDia: 'REMOTO'
        });
      } else if (existing.caracterDia === 'REMOTO') {
        // Actualizar a PRESENCIAL
        await saveDayAssignment({
          empleadoId: selectedEmpleadoId,
          fecha: dateStr,
          caracterDia: 'PRESENCIAL'
        });
      } else {
        // Eliminar asignación (Volver a SIN ASIGNAR)
        await deleteDayAssignment(existing.id);
      }
      // Volver a cargar el calendario
      await fetchCalendar();
    } catch (err) {
      console.error('Error toggling day character:', err);
      setApiError('No se pudo guardar la asignación del día.');
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Bulk / Lote assignments
  const handleBulkSubmit = async (formData) => {
    if (!selectedEmpleadoId) return false;
    setActionLoading(true);
    setApiError('');
    try {
      // Generar fechas en el rango
      const start = new Date(formData.fechaInicio);
      const end = new Date(formData.fechaFin);
      const asignaciones = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        asignaciones.push({
          empleadoId: selectedEmpleadoId,
          fecha: dateStr,
          caracterDia: formData.caracterDia
        });
      }

      await bulkSaveCalendar({
        empleadoId: selectedEmpleadoId,
        asignaciones
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setIsBulkModalOpen(false);
      await fetchCalendar();
      return true;
    } catch (err) {
      console.error('Error submitting bulk calendar:', err);
      const msg = err.response?.data?.message || 'Error al guardar las asignaciones en lote.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const openBulkModal = () => {
    setApiError('');
    setIsBulkModalOpen(true);
  };

  const closeBulkModal = () => {
    setIsBulkModalOpen(false);
    setApiError('');
  };

  return {
    currentYear,
    currentMonth,
    employees,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    assignments,
    loadingEmployees,
    loadingAssignments,
    actionLoading,
    apiError,
    success,
    isBulkModalOpen,
    handlePrevMonth,
    handleNextMonth,
    handleToggleDay,
    handleBulkSubmit,
    openBulkModal,
    closeBulkModal,
    refetchCalendar: fetchCalendar
  };
};
