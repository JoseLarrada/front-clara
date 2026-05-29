import { useState, useEffect, useCallback } from 'react';
import { 
  getEmployees, 
  createEmployee, 
  updateEmployee, 
  deleteEmployee,
  patchModalidad 
} from '../services/employeeService';

export const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  const [sort, setSort] = useState('creadoEn,desc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEmployee, setActiveEmployee] = useState(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmployees({
        page: pagination.page,
        size: pagination.size,
        sort
      });
      setEmployees(data.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sort]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleSortChange = (field) => {
    const [currentField, currentDir] = sort.split(',');
    let newDir = 'asc';
    if (currentField === field && currentDir === 'asc') {
      newDir = 'desc';
    }
    setSort(`${field},${newDir}`);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    setApiError('');
    try {
      if (activeEmployee) {
        // En base al PUT del contrato, enviamos los campos actualizados
        await updateEmployee(activeEmployee.id, {
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          rol: formData.rol,
          modalidadPerfil: formData.modalidadPerfil,
          saldoVacaciones: Number(formData.saldoVacaciones),
          activo: formData.activo
        });
      } else {
        // En base al POST del contrato, enviamos los datos incluyendo el password y fotoPatron
        await createEmployee({
          nombreCompleto: formData.nombreCompleto,
          email: formData.email,
          password: formData.password,
          rol: formData.rol,
          modalidadPerfil: formData.modalidadPerfil,
          fotoPatronUrl: formData.fotoPatronUrl || '',
          saldoVacaciones: Number(formData.saldoVacaciones),
          activo: formData.activo !== undefined ? formData.activo : true
        });
      }
      
      await fetchEmployees();
      closeModal();
      return true;
    } catch (err) {
      console.error('Error al guardar colaborador:', err);
      const msg = err.response?.data?.message || 'Error al guardar colaborador. Intente de nuevo.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (employee) => {
    setActionLoading(true);
    try {
      await updateEmployee(employee.id, {
        nombreCompleto: employee.nombreCompleto,
        email: employee.email,
        rol: employee.rol,
        modalidadPerfil: employee.modalidadPerfil,
        saldoVacaciones: employee.saldoVacaciones,
        activo: !employee.activo
      });
      await fetchEmployees();
    } catch (err) {
      console.error('Error toggling active state:', err);
      alert('No se pudo modificar el estado del colaborador.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleModalidadChange = async (id, nuevaModalidad) => {
    setActionLoading(true);
    try {
      await patchModalidad(id, nuevaModalidad);
      await fetchEmployees();
    } catch (err) {
      console.error('Error patching modality:', err);
      alert('No se pudo actualizar la modalidad del perfil laboral.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar permanentemente este colaborador? Se borrarán todos sus registros asociados.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await deleteEmployee(id);
      await fetchEmployees();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Ocurrió un error al intentar eliminar el colaborador.');
    } finally {
      setActionLoading(false);
    }
  };

  const openCreateModal = () => {
    setActiveEmployee(null);
    setApiError('');
    setIsModalOpen(true);
  };

  const openEditModal = (employee) => {
    setActiveEmployee(employee);
    setApiError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveEmployee(null);
    setApiError('');
  };

  // Filtrado local para el buscador rápido de nombre/correo
  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      emp.nombreCompleto.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term)
    );
  });

  return {
    employees: filteredEmployees,
    searchTerm,
    setSearchTerm,
    pagination,
    sort,
    loading,
    actionLoading,
    apiError,
    isModalOpen,
    activeEmployee,
    handlePageChange,
    handleSortChange,
    handleCreateOrUpdate,
    handleToggleActive,
    handleModalidadChange,
    handleDeleteEmployee,
    openCreateModal,
    openEditModal,
    closeModal
  };
};
