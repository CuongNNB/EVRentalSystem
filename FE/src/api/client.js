// src/api/client.js
import axios from "axios";

const baseURL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8084/EVRentalSystem/api/admin"
).replace(/\/$/, "");

const api = axios.create({ baseURL });

// Tự gắn token nếu có
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("ev_token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  // Log request để debug
  console.log(`[API Request] ${cfg.method?.toUpperCase()} ${cfg.baseURL}${cfg.url}`, {
    data: cfg.data,
    params: cfg.params,
  });
  return cfg;
});

// Response interceptor để xử lý lỗi tốt hơn
api.interceptors.response.use(
  (response) => {
    // Log success response
    console.log(`[API Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    // Log error chi tiết
    const errorInfo = {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      baseURL: error.config?.baseURL,
      data: error.response?.data,
      headers: error.response?.headers,
    };
    
    console.error('[API Error]', errorInfo);
    
    // Xử lý các loại lỗi phổ biến
    if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
      error.userMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.';
    } else if (error.response?.status === 500) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      error.userMessage = serverMessage 
        ? `Lỗi server: ${serverMessage}` 
        : 'Lỗi máy chủ (500). Vui lòng kiểm tra backend API hoặc liên hệ quản trị viên.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'Không tìm thấy tài nguyên. Endpoint API có thể không tồn tại.';
    } else if (error.response?.status === 403) {
      error.userMessage = 'Bạn không có quyền thực hiện hành động này.';
    } else if (error.response?.status === 401) {
      error.userMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (error.response?.status === 400) {
      const serverMessage = error.response?.data?.message || error.response?.data?.error;
      error.userMessage = serverMessage 
        ? `Dữ liệu không hợp lệ: ${serverMessage}` 
        : 'Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.';
    } else if (error.message?.includes('CORS')) {
      error.userMessage = 'Lỗi CORS: Backend chưa cấu hình CORS cho phép frontend truy cập. Vui lòng kiểm tra cấu hình backend.';
    } else if (error.response?.data?.message) {
      error.userMessage = error.response.data.message;
    } else {
      error.userMessage = error.message || 'Đã xảy ra lỗi không xác định.';
    }
    
    return Promise.reject(error);
  }
);

export default api;
