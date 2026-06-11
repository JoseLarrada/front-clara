import { useState, useEffect } from 'react';
import api from './api';

// In-memory cache for S3 download URLs: fileKey -> { downloadUrl, expiresAt }
const s3Cache = {};

// Cache duration: 25 minutes in milliseconds (S3 link is valid for 30 minutes)
const CACHE_DURATION_MS = 25 * 60 * 1000;

export const extractS3Key = (url) => {
  if (!url) return null;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return url;
  }
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const pathname = decodeURIComponent(parsed.pathname);
    
    // Case 1: https://bucket.s3.amazonaws.com/key or with region
    if (hostname.includes('.s3.') || hostname.endsWith('.s3.amazonaws.com')) {
      return pathname.startsWith('/') ? pathname.substring(1) : pathname;
    }
    
    // Case 2: https://s3.amazonaws.com/bucket-name/key
    if (hostname === 's3.amazonaws.com') {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) {
        return parts.slice(1).join('/');
      }
    }
  } catch (e) {
    console.error('Error parsing S3 URL:', url, e);
  }
  
  return null;
};

export const getDownloadUrl = async (fileKey) => {
  if (!fileKey) return null;

  const key = extractS3Key(fileKey);
  if (!key) {
    if (fileKey.startsWith('http://') || fileKey.startsWith('https://')) {
      return fileKey;
    }
    return null;
  }

  // Check cache using the extracted key
  const cached = s3Cache[key];
  if (cached && Date.now() < cached.expiresAt) {
    return cached.downloadUrl;
  }

  // Request new signed URL
  try {
    const response = await api.get('/api/v1/media/download-url', {
      params: { fileKey: key },
    });
    
    // Support unwrapped response.data or wrapped response.data.data
    let downloadUrl = '';
    if (response.data && response.data.success && response.data.data) {
      downloadUrl = response.data.data.downloadUrl;
    } else if (response.data) {
      downloadUrl = response.data.downloadUrl;
    }

    if (downloadUrl) {
      s3Cache[key] = {
        downloadUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      };
      return downloadUrl;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching download URL for key:', key, error);
    // Return key itself or fallback to check if we can simulate
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      // Offline fallback: return the key or simulated URL
      return fileKey;
    }
    return null;
  }
};

export const uploadJustificacion = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/media/upload/justificacion', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    
    // Backend returns { fileKey, downloadUrl } or wrapped in success/data
    let result = response.data;
    if (response.data && response.data.success && response.data.data) {
      result = response.data.data;
    }
    
    // Store in cache
    if (result && result.fileKey && result.downloadUrl) {
      s3Cache[result.fileKey] = {
        downloadUrl: result.downloadUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      };
    }
    return result; // { fileKey, downloadUrl }
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Network Error: Simulating S3 upload for justificacion');
      const mockKey = `justificaciones/mock_${Date.now()}_${file.name}`;
      const objectUrl = URL.createObjectURL(file);
      s3Cache[mockKey] = {
        downloadUrl: objectUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      };
      return { fileKey: mockKey, downloadUrl: objectUrl };
    }
    throw error;
  }
};

export const uploadFotoEmpleado = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/media/upload/empleado', formData, {
      headers: {
        'Content-Type': undefined,
      },
    });
    
    // Backend returns { fileKey, downloadUrl } or wrapped in success/data
    let result = response.data;
    if (response.data && response.data.success && response.data.data) {
      result = response.data.data;
    }
    
    // Store in cache
    if (result && result.fileKey && result.downloadUrl) {
      s3Cache[result.fileKey] = {
        downloadUrl: result.downloadUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      };
    }
    return result; // { fileKey, downloadUrl }
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Network Error: Simulating S3 upload for foto de empleado');
      const mockKey = `empleados/mock_${Date.now()}_${file.name}`;
      const objectUrl = URL.createObjectURL(file);
      s3Cache[mockKey] = {
        downloadUrl: objectUrl,
        expiresAt: Date.now() + CACHE_DURATION_MS,
      };
      return { fileKey: mockKey, downloadUrl: objectUrl };
    }
    throw error;
  }
};

export const useS3Url = (fileKey, fallbackUrl = '') => {
  const [url, setUrl] = useState(fallbackUrl);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!fileKey) {
      setUrl(fallbackUrl);
      return;
    }
    
    const key = extractS3Key(fileKey);
    if (!key && (fileKey.startsWith('http://') || fileKey.startsWith('https://') || fileKey.startsWith('blob:') || fileKey.startsWith('data:'))) {
      setUrl(fileKey);
      return;
    }

    let isMounted = true;
    const fetchUrl = async () => {
      setLoading(true);
      const resolved = await getDownloadUrl(fileKey);
      if (isMounted) {
        setUrl(resolved || fallbackUrl);
        setLoading(false);
      }
    };

    fetchUrl();

    return () => {
      isMounted = false;
    };
  }, [fileKey, fallbackUrl]);

  return { url, loading };
};
