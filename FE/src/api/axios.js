import axios from "axios";

// ✅ Base URL: Lấy từ .env hoặc fallback sang localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8084/EVRentalSystem/api";

// ✅ Tạo instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Giới hạn thời gian request (10s)
});

// ✅ Tự động gắn token (nếu có)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    console.error("❌ Request setup error:", error);
    return Promise.reject(error);
  }
);

// ✅ Bắt lỗi tập trung
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Trường hợp không kết nối được đến server
    if (!error.response) {
      console.error("🚫 Không thể kết nối đến server:", error.message);
      alert("Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy!");
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Token hết hạn hoặc không hợp lệ
    if (status === 401) {
      console.warn("🔒 Token hết hạn hoặc không hợp lệ.");
      localStorage.removeItem("token");
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      window.location.href = "/login";
    }

    // Lỗi không tìm thấy API
    if (status === 404) {
      console.warn("❌ API không tồn tại:", error.config?.url);
      alert("Không tìm thấy API. Vui lòng kiểm tra lại đường dẫn backend.");
    }

    // Lỗi từ server trả về
    if (status >= 500) {
      console.error("💥 Lỗi server:", data?.message || error.message);
      alert("Máy chủ đang gặp sự cố. Vui lòng thử lại sau.");
    }

    return Promise.reject(error);
  }
);

export default api;
