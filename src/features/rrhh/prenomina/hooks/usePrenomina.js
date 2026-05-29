import { useState, useEffect, useCallback } from 'react';
import { getEmployees } from '../../employees/services/employeeService';
import {
  getPrenominaConsolidado,
  generatePrenomina,
  getPrenominaReports,
  exportReport
} from '../services/prenominaService';

export const usePrenomina = () => {
  // Pre-load current month dates
  const getInitialDates = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    // Primer dia del mes
    const start = `${y}-${m}-01`;
    // Ultimo dia del mes (o dia de hoy)
    const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
    const end = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
    return { start, end };
  };

  const { start, end } = getInitialDates();
  
  const [fechaInicio, setFechaInicio] = useState(start);
  const [fechaFin, setFechaFin] = useState(end);
  const [empleadoId, setEmpleadoId] = useState(''); // vacío = Todos
  const [isSimulation, setIsSimulation] = useState(true);

  // Resultados
  const [results, setResults] = useState([]);
  const [historicalReports, setHistoricalReports] = useState([]);
  const [employees, setEmployees] = useState([]);
  
  const [pagination, setPagination] = useState({ page: 0, size: 5, totalElements: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Load employees
  const fetchEmployeesList = useCallback(async () => {
    setLoadingEmployees(true);
    try {
      const res = await getEmployees({ size: 100, sort: 'nombreCompleto,asc' });
      const list = res?.content || res || [];
      setEmployees(list.filter(e => e.activo));
    } catch (err) {
      console.error('Error loading employees for pre-payroll:', err);
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  // Fetch historical saved reports
  const fetchHistoricalReports = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await getPrenominaReports({
        page: pagination.page,
        size: pagination.size,
        fechaInicio,
        fechaFin,
        sort: 'generadoEl,desc'
      });
      setHistoricalReports(res.content || []);
      setPagination(prev => ({
        ...prev,
        totalElements: res.totalElements || 0,
        totalPages: res.totalPages || 0
      }));
    } catch (err) {
      console.error('Error fetching pre-payroll reports history:', err);
    } finally {
      setLoadingHistory(false);
    }
  }, [pagination.page, pagination.size, fechaInicio, fechaFin]);

  useEffect(() => {
    fetchEmployeesList();
  }, [fetchEmployeesList]);

  useEffect(() => {
    fetchHistoricalReports();
  }, [fetchHistoricalReports]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // Run calculation
  const handleCalculate = async () => {
    if (!fechaInicio || !fechaFin) {
      setApiError('Debe ingresar el rango de fecha del periodo.');
      return;
    }
    if (new Date(fechaFin) < new Date(fechaInicio)) {
      setApiError('La fecha de fin debe ser posterior a la fecha de inicio.');
      return;
    }

    setLoading(true);
    setApiError('');
    setSuccess(false);
    setResults([]);

    try {
      if (isSimulation) {
        // Simulación en caliente (GET consolidado)
        const data = await getPrenominaConsolidado({
          fechaInicio,
          fechaFin,
          empleadoId: empleadoId || undefined
        });
        setResults(data);
      } else {
        // Cierre real persistente (POST generar)
        const data = await generatePrenomina({
          fechaInicio,
          fechaFin,
          empleadoId: empleadoId || undefined
        });
        setResults(data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
        // Recargar histórico
        await fetchHistoricalReports();
      }
    } catch (err) {
      console.error('Error calculating pre-payroll:', err);
      const msg = err.response?.data?.message || 'Ocurrió un error al procesar el reporte.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Export to file
  const handleExport = async (type) => {
    if (!fechaInicio || !fechaFin) {
      alert('Debe ingresar un periodo antes de exportar.');
      return;
    }
    setActionLoading(true);
    try {
      await exportReport(type, {
        fechaInicio,
        fechaFin,
        empleadoId: empleadoId || undefined
      });
    } catch (err) {
      console.error('Error exporting report:', err);
      alert('No se pudo exportar el reporte en este momento.');
    } finally {
      setActionLoading(false);
    }
  };

  return {
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    empleadoId,
    setEmpleadoId,
    isSimulation,
    setIsSimulation,
    results,
    historicalReports,
    employees,
    pagination,
    loading,
    loadingHistory,
    loadingEmployees,
    actionLoading,
    apiError,
    success,
    handlePageChange,
    handleCalculate,
    handleExport,
    refetchHistory: fetchHistoricalReports
  };
};
