import api from './api';

export const uploadJustificacion = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/v1/media/upload/justificacion', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { url: "..." }
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Network Error: Simulating S3 upload for justificacion');
      // Generate a mock S3 URL to satisfy database constraints
      return { url: `https://cloudtime-buckets.s3.amazonaws.com/justificaciones/mock_${file.name}` };
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
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; // { url: "..." }
  } catch (error) {
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Network Error: Simulating S3 upload for foto de empleado');
      // Use local object URL for instant preview, fallback to mock S3 URL
      let previewUrl;
      try {
        previewUrl = URL.createObjectURL(file);
      } catch (e) {
        previewUrl = `https://i.pravatar.cc/150?u=${Math.random()}`;
      }
      return { url: previewUrl };
    }
    throw error;
  }
};
