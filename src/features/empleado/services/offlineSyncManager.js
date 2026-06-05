import { empleadoService } from './empleadoService';

const OFFLINE_QUEUE_KEY = 'cloudtime_offline_gps_queue';

export const offlineSyncManager = {
  queueLocation: (location) => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      queue.push(location);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      console.log('Ubicacion guardada en cola offline:', location);
    } catch (e) {
      console.error('Error al guardar ubicacion offline en localStorage', e);
    }
  },

  syncOfflineQueue: async () => {
    if (!navigator.onLine) return;
    
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      if (queue.length === 0) return;
      
      console.log(`Intentando sincronizar ${queue.length} ubicaciones offline...`);
      
      await empleadoService.enviarUbicaciones(queue);
      
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
      console.log('Cola offline sincronizada correctamente.');
    } catch (e) {
      console.error('Error durante la sincronizacion offline de geolocalizacion:', e);
    }
  },

  getQueueLength: () => {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
      return queue.length;
    } catch (e) {
      return 0;
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineSyncManager.syncOfflineQueue();
  });
}
