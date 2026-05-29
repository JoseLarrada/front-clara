import { useState, useEffect, useCallback } from 'react';
import { getEmployees } from '../../employees/services/employeeService';
import {
  getGeocercas,
  createGeocerca,
  updateGeocerca,
  deleteGeocerca
} from '../services/geocercaService';

export const useGeocercas = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmpleadoId, setSelectedEmpleadoId] = useState('');
  const [geocercas, setGeocercas] = useState([]);
  
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingGeocercas, setLoadingGeocercas] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeGeocerca, setActiveGeocerca] = useState(null);

  // Load employees for search selector
  const fetchEmployeesList = useCallback(async () => {
    setLoadingEmployees(true);
    setApiError('');
    try {
      // Pedimos una cantidad representativa para el autocompletado en frontend
      const res = await getEmployees({ size: 100, sort: 'nombreCompleto,asc' });
      // Soportar respuesta plana o paginada
      const list = res?.content || res || [];
      // Filtrar por activos
      setEmployees(list.filter(e => e.activo));
      
      // Auto-seleccionar primer empleado si existe
      const activeList = list.filter(e => e.activo);
      if (activeList.length > 0) {
        setSelectedEmpleadoId(activeList[0].id);
      }
    } catch (err) {
      console.error('Error fetching employees for geocercas:', err);
      setApiError('No se pudo cargar la lista de colaboradores.');
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch geocercas for current selected employee
  const fetchGeocercas = useCallback(async () => {
    if (!selectedEmpleadoId) {
      setGeocercas([]);
      return;
    }
    setLoadingGeocercas(true);
    setApiError('');
    try {
      const data = await getGeocercas(selectedEmpleadoId);
      setGeocercas(data || []);
    } catch (err) {
      console.error('Error fetching geocercas:', err);
      setApiError('No se pudieron cargar las geocercas del colaborador.');
    } finally {
      setLoadingGeocercas(false);
    }
  }, [selectedEmpleadoId]);

  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  useEffect(() => {
    fetchGeocercas();
  }, [fetchGeocercas]);

  const handleCreateOrUpdate = async (formData) => {
    if (!selectedEmpleadoId) {
      setApiError('Debe seleccionar un empleado antes de guardar la geocerca.');
      return false;
    }

    setActionLoading(true);
    setApiError('');
    try {
      const payload = {
        empleadoId: selectedEmpleadoId,
        descripcion: formData.descripcion,
        latitud: Number(formData.latitud),
        longitud: Number(formData.longitud),
        radioToleranciaMetros: Number(formData.radioToleranciaMetros)
      };

      if (activeGeocerca) {
        await updateGeocerca(activeGeocerca.id, payload);
      } else {
        await createGeocerca(payload);
      }

      await fetchGeocercas();
      closeModal();
      return true;
    } catch (err) {
      console.error('Error saving geocerca:', err);
      const msg = err.response?.data?.message || 'Error al guardar la geocerca. Revise coordenadas y límites.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteGeocerca = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar este perímetro de marcación? El empleado ya no podrá marcar asistencia en esta geocerca.')) {
      return;
    }

    setActionLoading(true);
    try {
      await deleteGeocerca(id);
      await fetchGeocercas();
    } catch (err) {
      console.error('Error deleting geocerca:', err);
      alert('Ocurrió un error al eliminar la geocerca.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setActiveGeocerca(null);
    setApiError('');
    setIsModalOpen(true);
  };

  const openEditModal = (geocerca) => {
    setActiveGeocerca(geocerca);
    setApiError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveGeocerca(null);
    setApiError('');
  };

  return {
    employees,
    selectedEmpleadoId,
    setSelectedEmpleadoId,
    geocercas,
    loadingEmployees,
    loadingGeocercas,
    actionLoading,
    apiError,
    isModalOpen,
    activeGeocerca,
    handleCreateOrUpdate,
    handleDeleteGeocerca,
    openCreateModal,
    openEditModal,
    closeModal,
    refetch: fetchGeocercas
  };
};
