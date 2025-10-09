import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8084/EVRentalSystem", // đúng URL backend
  withCredentials: true, // gửi session cookie
});

// Gắn token vào header mỗi khi gọi API
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("ev_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Nếu token hết hạn → tự logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("ev_user");
      localStorage.removeItem("ev_token");
      
      // Chỉ redirect nếu không phải trang login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
