export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Función para hacer peticiones HTTP
const fetchAPI = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  };

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error en ${endpoint}:`, error);
    throw error;
  }
};

// Servicios de autenticación
export const authService = {
  // Registrar usuario
  register: async (userData) => {
    return await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Iniciar sesión
  login: async (credentials) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Verificar token
  verifyToken: async (token) => {
    return await fetchAPI('/auth/verificar', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  // Cerrar sesión
  logout: async () => {
    return await fetchAPI('/auth/logout', {
      method: 'POST',
    });
  },

  // Obtener perfil
  getProfile: async (token) => {
    return await fetchAPI('/auth/perfil', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};
