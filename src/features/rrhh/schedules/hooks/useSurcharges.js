import { useState, useEffect, useCallback } from 'react';
import { getSurcharges, saveSurcharges } from '../services/scheduleService';

export const useSurcharges = () => {
  const [surcharges, setSurcharges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const fetchSurcharges = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getSurcharges();
      setSurcharges(data);
    } catch (err) {
      console.error('Error fetching surcharges:', err);
      setError('No se pudo cargar la configuración de recargos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurcharges();
  }, [fetchSurcharges]);

  const handleSave = async (formData) => {
    setActionLoading(true);
    setError('');
    setSuccess(false);
    const isUpdate = !!(surcharges && surcharges.id);
    try {
      const data = await saveSurcharges({
        factorHoraExtraDiurna: Number(formData.factorHoraExtraDiurna),
        factorHoraExtraNocturna: Number(formData.factorHoraExtraNocturna),
        factorHoraDominicalFestiva: Number(formData.factorHoraDominicalFestiva),
        multaRetardoPorMinuto: Number(formData.multaRetardoPorMinuto)
      }, isUpdate);
      setSurcharges(data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      return true;
    } catch (err) {
      console.error('Error saving surcharges:', err);
      const msg = err.response?.data?.message || 'Error al guardar los recargos. Verifique los límites.';
      setError(msg);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  return {
    surcharges,
    loading,
    actionLoading,
    error,
    success,
    handleSave,
    refetch: fetchSurcharges
  };
};
