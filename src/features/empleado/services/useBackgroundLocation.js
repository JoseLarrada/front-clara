import { useEffect, useRef } from 'react';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { empleadoService } from './empleadoService';
import { offlineSyncManager } from './offlineSyncManager';

const BackgroundGeolocation = registerPlugin('BackgroundGeolocation');

export const useBackgroundLocation = (jornadaActiva, intervalMs = 15000) => {
  const intervalRef = useRef(null);
  const watcherIdRef = useRef(null);

  useEffect(() => {
    if (!jornadaActiva) {
      // Limpiar watcher nativo si existe
      if (watcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current })
          .then(() => {
            console.log('Watcher de geolocalización nativo removido.');
            watcherIdRef.current = null;
          })
          .catch(err => console.error('Error al remover watcher nativo:', err));
      }

      // Limpiar intervalo web si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const reportLocation = async (lat, lng, accuracy, speed, heading, timestamp) => {
      const locationData = {
        latitud: lat,
        longitud: lng,
        precisionGps: accuracy ? parseFloat(accuracy.toFixed(2)) : null,
        velocidad: speed ? parseFloat(speed.toFixed(2)) : null,
        direccion: heading ? parseFloat(heading.toFixed(2)) : null,
        registradoEn: timestamp || new Date().toISOString()
      };

      if (navigator.onLine) {
        try {
          await offlineSyncManager.syncOfflineQueue();
          await empleadoService.enviarUbicaciones([locationData]);
          console.log('Ubicación reportada al backend:', locationData);
        } catch (error) {
          console.error('Error al enviar ubicación actual, guardando offline:', error);
          offlineSyncManager.queueLocation(locationData);
        }
      } else {
        offlineSyncManager.queueLocation(locationData);
      }
    };

    // --- MODO NATIVO (CAPACITOR) ---
    if (Capacitor.isNativePlatform()) {
      console.log('Iniciando rastreo de ubicación en segundo plano nativo...');
      
      const startNativeTracking = async () => {
        try {
          const watcherId = await BackgroundGeolocation.addWatcher(
            {
              backgroundMessage: 'Monitoreando jornada laboral en vivo...',
              backgroundTitle: 'CloudTime GPS',
              requestPermissions: true,
              stale: false,
              distanceFilter: 10 // Reportar cada 10 metros de cambio o según eventos
            },
            (location, error) => {
              if (error) {
                console.error('Error en geolocalización nativa de background:', error);
                return;
              }
              if (location) {
                console.log('Punto GPS nativo recibido:', location);
                const timestamp = location.time ? new Date(location.time).toISOString() : new Date().toISOString();
                reportLocation(
                  location.latitude,
                  location.longitude,
                  location.accuracy,
                  location.speed,
                  location.bearing,
                  timestamp
                );
              }
            }
          );
          watcherIdRef.current = watcherId;
          console.log('Watcher nativo registrado con ID:', watcherId);
        } catch (err) {
          console.error('Fallo al inicializar BackgroundGeolocation nativo, usando fallback web:', err);
          startWebFallback();
        }
      };

      startNativeTracking();
    } else {
      // --- MODO WEB (PWA FALLBACK) ---
      startWebFallback();
    }

    function startWebFallback() {
      console.log('Iniciando rastreo de ubicación web...');
      const capturarUbicacionWeb = () => {
        if (!navigator.geolocation) {
          console.warn('Geolocalización no soportada en este navegador.');
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy, speed, heading } = position.coords;
            const timestamp = new Date(position.timestamp).toISOString();
            reportLocation(latitude, longitude, accuracy, speed, heading, timestamp);
          },
          (error) => {
            console.error('Error al capturar GPS web:', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      };

      capturarUbicacionWeb();
      intervalRef.current = setInterval(capturarUbicacionWeb, intervalMs);
    }

    return () => {
      // Cleanup
      if (watcherIdRef.current) {
        BackgroundGeolocation.removeWatcher({ id: watcherIdRef.current })
          .then(() => {
            watcherIdRef.current = null;
          })
          .catch(err => console.error('Error al limpiar watcher nativo:', err));
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jornadaActiva, intervalMs]);
};
