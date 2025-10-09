// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  AUTH_SERVER: import.meta.env.VITE_AUTH_SERVER || 'http://localhost:3001',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
};

export default API_CONFIG;
