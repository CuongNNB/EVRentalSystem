// Mock API service for testing when backend is not available
const MOCK_DELAY = 1000; // 1 second delay to simulate network

const mockUsers = [
  {
    id: 1,
    name: "Test User",
    email: "test@example.com",
    phone: "0123456789",
    password: "123456", // Thêm password cho user test
    createdAt: new Date().toISOString()
  }
];

const mockTokens = {
  "test@example.com": "mock_jwt_token_12345",
  "tinhpham@gmail.com": "mock_jwt_token_67890"
};

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
export const mockUserApi = {
  // Mock register
  register: async (userData) => {
    await delay(MOCK_DELAY);
    
    // Simulate validation
    if (userData instanceof FormData) {
      const name = userData.get('name');
      const email = userData.get('email');
      const phone = userData.get('phone');
      const password = userData.get('password');
      const gplxFront = userData.get('gplxFront');
      const gplxBack = userData.get('gplxBack');
      const cccdFront = userData.get('cccdFront');
      const cccdBack = userData.get('cccdBack');
      
      if (!name || !email || !phone || !password) {
        throw new Error('Vui lòng nhập đầy đủ thông tin');
      }
      
      if (!gplxFront || !gplxBack || !cccdFront || !cccdBack) {
        throw new Error('Vui lòng tải lên đầy đủ GPLX (2 mặt) và CCCD (2 mặt)');
      }
      
      if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
      }
      
      // Check if email already exists
      const existingUser = mockUsers.find(user => user.email === email);
      if (existingUser) {
        throw new Error('Email đã được sử dụng');
      }
      
      // Create new user
      const newUser = {
        id: mockUsers.length + 1,
        name,
        email,
        phone,
        password, // Lưu password vào user
        createdAt: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      mockTokens[email] = `mock_jwt_token_${Date.now()}`;
      
      return {
        success: true,
        message: 'Đăng ký thành công',
        data: newUser
      };
    } else {
      throw new Error('Dữ liệu không hợp lệ');
    }
  },

  // Mock login
  login: async (credentials) => {
    await delay(MOCK_DELAY);
    
    const { email, password } = credentials;
    
    if (!email || !password) {
      throw new Error('Vui lòng nhập đầy đủ thông tin');
    }
    
    // Tìm user theo email
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    
    // Xác thực password
    if (user.password !== password) {
      throw new Error('Email hoặc mật khẩu không đúng');
    }
    
    const token = mockTokens[email] || `mock_jwt_token_${Date.now()}`;
    
    return {
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        user,
        token
      }
    };
  },

  // Mock update profile
  updateProfile: async (userId, userData) => {
    await delay(MOCK_DELAY);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    Object.assign(user, userData);
    
    return {
      success: true,
      message: 'Cập nhật thành công',
      data: user
    };
  },

  // Mock change password
  changePassword: async (userId, passwordData) => {
    await delay(MOCK_DELAY);
    
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      throw new Error('Không tìm thấy người dùng');
    }
    
    return {
      success: true,
      message: 'Đổi mật khẩu thành công',
      data: user
    };
  }
};

// Check if backend is available
export const checkBackendHealth = async () => {
  try {
    const response = await fetch('http://localhost:8080/actuator/health', {
      method: 'GET',
      timeout: 3000
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Auto-switch between real and mock API
export const getApiService = async () => {
  const isBackendOnline = await checkBackendHealth();
  return isBackendOnline ? 'real' : 'mock';
};
