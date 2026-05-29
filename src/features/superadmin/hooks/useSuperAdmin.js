import { useState, useEffect, useCallback } from 'react';
import { 
  getDashboardStats, 
  getEmpresas, 
  createEmpresa, 
  updateEmpresa, 
  updateEmpresaEstado, 
  deleteEmpresa,
  registerUser
} from '../services/superAdminService';

export const useSuperAdmin = () => {
  // Estados de datos
  const [stats, setStats] = useState({ totalEmpresasActivas: 0, totalEmpleadosGlobales: 0 });
  const [empresas, setEmpresas] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  
  // Estados de control
  const [activeTab, setActiveTab] = useState('empresas'); // 'empresas' | 'register'
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [filters, setFilters] = useState({ nombre: '', nitRut: '', rubro: '', estadoLicencia: '' });
  const [sort, setSort] = useState('creadoEn,desc');
  
  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  
  // Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeEmpresa, setActiveEmpresa] = useState(null);

  // Obtener estadísticas agregadas
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Obtener listado de empresas filtradas
  const fetchEmpresas = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sort,
        ...filters
      };
      
      // Limpiar campos vacíos de los parámetros para evitar URLs sucias
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const data = await getEmpresas(params);
      
      // Guardar el listado de empresas
      setEmpresas(data?.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: data?.totalElements || 0,
        totalPages: data?.totalPages || 0
      }));

      // Si el endpoint unificado nos devolvió las estadísticas globales en la misma petición
      if (data && data.totalEmpresasActivas !== undefined && data.totalEmpleadosGlobales !== undefined) {
        setStats({
          totalEmpresasActivas: data.totalEmpresasActivas,
          totalEmpleadosGlobales: data.totalEmpleadosGlobales
        });
        setStatsLoading(false);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, sort, filters]);

  // Ejecución inicial y reactiva
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  // Manejadores de paginación y filtros
  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reiniciar a primera página al filtrar
  };

  const handleClearFilters = () => {
    setFilters({ nombre: '', nitRut: '', rubro: '', estadoLicencia: '' });
    setPagination(prev => ({ ...prev, page: 0 }));
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

  // Acciones CRUD
  const handleCreateOrUpdate = async (formData) => {
    setActionLoading(true);
    setApiError('');
    try {
      if (activeEmpresa) {
        // Actualizar
        await updateEmpresa(activeEmpresa.id, {
          nombre: formData.nombre,
          rubro: formData.rubro,
          limiteEmpleados: Number(formData.limiteEmpleados)
        });
      } else {
        // Crear
        await createEmpresa(formData);
      }
      
      // Éxito: refrescar listados y cerrar modal
      await fetchEmpresas();
      await fetchStats();
      closeModal();
      return true;
    } catch (err) {
      console.error('Error al guardar empresa:', err);
      const msg = err.response?.data?.message || 'Error al procesar la solicitud. Intente nuevamente.';
      setApiError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleLicense = async (id, currentStatus) => {
    setActionLoading(true);
    const nuevoEstado = currentStatus === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    try {
      await updateEmpresaEstado(id, nuevoEstado);
      // Refrescar directamente el listado y stats para reflejar cambios
      await fetchEmpresas();
      await fetchStats();
    } catch (err) {
      console.error('Error al cambiar licencia:', err);
      alert('No se pudo actualizar el estado de la licencia.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Está seguro de que desea eliminar permanentemente esta empresa? Esta acción es irreversible y afectará a todos sus usuarios.')) {
      return;
    }
    
    setActionLoading(true);
    try {
      await deleteEmpresa(id);
      await fetchEmpresas();
      await fetchStats();
    } catch (err) {
      console.error('Error al eliminar empresa:', err);
      alert('Ocurrió un error al intentar eliminar la empresa.');
    } finally {
      setActionLoading(false);
    }
  };

  // Controladores de Modales
  const openCreateModal = () => {
    setActiveEmpresa(null);
    setApiError('');
    setIsModalOpen(true);
  };

  const openEditModal = (empresa) => {
    setActiveEmpresa(empresa);
    setApiError('');
    setIsModalOpen(true);
  };

  const handleRegisterUser = async (formData) => {
    setActionLoading(true);
    setRegisterError('');
    setRegisterSuccess(false);
    try {
      await registerUser(formData);
      setRegisterSuccess(true);
      await fetchStats();
      return true;
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      const msg = err.response?.data?.message || 'Error al registrar el usuario. Verifique los campos e intente nuevamente.';
      setRegisterError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActiveEmpresa(null);
    setApiError('');
  };

  return {
    stats,
    statsLoading,
    empresas,
    pagination,
    filters,
    sort,
    loading,
    actionLoading,
    apiError,
    isModalOpen,
    activeEmpresa,
    activeTab,
    setActiveTab,
    registerSuccess,
    setRegisterSuccess,
    registerError,
    setRegisterError,
    handleRegisterUser,
    handlePageChange,
    handleFilterChange,
    handleClearFilters,
    handleSortChange,
    handleCreateOrUpdate,
    handleToggleLicense,
    handleDelete,
    openCreateModal,
    openEditModal,
    closeModal
  };
};
