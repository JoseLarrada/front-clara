import api from '../../../services/api';

/**
 * Realiza la llamada de inicio de sesión
 * @param {string} email 
 * @param {string} password 
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/api/v1/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // Si no hay respuesta o falla por red (servidor apagado), usar fallback en modo demostración
    if (!error.response && (error.code === 'ERR_NETWORK' || error.message === 'Network Error')) {
      console.warn('Backend offline. Utilizando datos simulados (mock) conforme al contrato.');
      return await mockLogin(email, password);
    }
    throw error;
  }
};

/**
 * Simulación de Login para pruebas sin backend
 */
const mockLogin = (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Credencial de superadmin (exacta o con palabra 'super')
      if (email === 'jose@mail.com' || email.includes('super')) {
        resolve({
          access_token: generateMockJWT(email, ['ROLE_SUPER_ADMIN']),
          refresh_token: 'mock-refresh-token-superadmin-12345',
          token_type: 'Bearer'
        });
      } // Credencial de administrador de RRHH (con palabra 'rrhh' o 'admin')
      else if (email.includes('rrhh') || email.includes('admin')) {
        resolve({
          access_token: generateMockJWT(email, ['ROLE_ADMIN_RRHH']),
          refresh_token: 'mock-refresh-token-rrhh-12345',
          token_type: 'Bearer'
        });
      } else if (email.includes('colaborador') || email.includes('user') || email.includes('empleado')) {
        resolve({
          access_token: generateMockJWT(email, ['ROLE_COLABORADOR']),
          refresh_token: 'mock-refresh-token-colaborador-12345',
          token_type: 'Bearer'
        });
      } else {
        const err = new Error('Bad credentials');
        err.response = {
          status: 401,
          data: {
            message: 'Correo electrónico o contraseña incorrectos.'
          }
        };
        reject(err);
      }
    }, 1000);
  });
};

/**
 * Genera un token JWT falso pero válido estructuralmente para nuestro decodificador
 */
const generateMockJWT = (email, roles) => {
  const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payloadObj = {
    token_type: 'ACCESS_TOKEN',
    tenant_id: '0757d941-2038-4abc-a0e3-fd1eaffd4bf3',
    user_id: '877a8298-bd09f-43a6-b3f9-6e63e8ddc5d3',
    roles: roles,
    context: {
      nombre_completo: email === 'jose@mail.com' ? 'Jose Larrada' : 'Usuario Demo',
      modalidad_perfil: 'HIBRIDO'
    },
    sub: email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  };
  
  // Convertimos a base64url seguro para evitar caracteres incompatibles
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(payloadObj))))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${header}.${payload}.signature_hash`;
};
