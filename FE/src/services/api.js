import { API_CONFIG } from '../config/api';

// API configuration and base URL
const API_BASE_URL = API_CONFIG.BASE_URL;

// Generic API response handler
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Check if backend is available
const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/actuator/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add token to headers if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    console.error('API call failed:', error);
    
    // Handle specific error types
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo backend đang chạy.');
    }
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Lỗi kết nối: Backend server không phản hồi. Vui lòng kiểm tra server có đang chạy không.');
    }
    
    throw error;
  }
};

// User API calls
export const userApi = {
  // Register new user
  register: async (userData) => {
    // Check if userData is FormData (file upload)
    if (userData instanceof FormData) {
      const url = `${API_BASE_URL}/api/users/register`;
      const token = localStorage.getItem('token');
      
      const config = {
        method: 'POST',
        body: userData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      };

      try {
        const response = await fetch(url, config);
        return await handleApiResponse(response);
      } catch (error) {
        console.error('Register API call failed:', error);
        throw error;
      }
    } else {
      return apiCall('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
  },

  // Login user
  login: async (credentials) => {
    return apiCall('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Update user profile
  updateProfile: async (userId, userData) => {
    return apiCall(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Change password
  changePassword: async (userId, passwordData) => {
    return apiCall(`/api/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

export default apiCall;
