import { useState, useEffect, useCallback } from 'react';
import { 
  getScheduleRulesPaginated, 
  createScheduleRule, 
  updateScheduleRule, 
  deleteScheduleRule 
} from '../services/scheduleService';

export const useScheduleRules = () => {
  const [rules, setRules] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRule, setActiveRule] = useState(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getScheduleRulesPaginated({
        page: pagination.page,
        size: pagination.size
      });
      setRules(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching schedule rules:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    setApiError('');
    try {
      if (activeRule) {
        await updateScheduleRule(activeRule.id, {
          descripcion: formData.descripcion,
          horaEntradaOficial: formData.horaEntradaOficial,
          horaSalidaOficial: formData.horaSalidaOficial,
          minutosToleranciaRetardo: Number(formData.minutosToleranciaRetardo),
          tiempoLimiteFaltaMinutos: Number(formData.tiempoLimiteFaltaMinutos)
        });
      } else {
        await createScheduleRule({
          descripcion: formData.descripcion,
          horaEntradaOficial: formData.horaEntradaOficial,
          horaSalidaOficial: formData.horaSalidaOficial,
          minutosToleranciaRetardo: Number(formData.minutosToleranciaRetardo),
          tiempoLimiteFaltaMinutos: Number(formData.tiempoLimiteFaltaMinutos)
        });
      }
      
      await fetchRules();
      closeModal();
      return true;
    } catch (err) {
      console.error('Error saving schedule rule:', err);
      const msg = err.response?.data?.message || 'Error al guardar jornada. Comprueba el formato (HH:mm:ss).';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar esta jornada? Los empleados asociados perderán esta configuración.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await deleteScheduleRule(id);
      await fetchRules();
    } catch (err) {
      console.error('Error deleting schedule rule:', err);
      alert('Ocurrió un error al eliminar la jornada.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setActiveRule(null);
    setApiError('');
    setIsModalOpen(true);
  };

  const openEditModal = (rule) => {
    setActiveRule(rule);
    setApiError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveRule(null);
    setApiError('');
  };

  return {
    rules,
    pagination,
    loading,
    actionLoading,
    apiError,
    isModalOpen,
    activeRule,
    handlePageChange,
    handleCreateOrUpdate,
    handleDeleteRule,
    openCreateModal,
    openEditModal,
    closeModal,
    refetch: fetchRules
  };
};
