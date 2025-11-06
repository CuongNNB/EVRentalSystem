// src/api/client.js
import axios from "axios";

const baseURL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:8084/EVRentalSystem/api"
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

// ⚙️ Xử lý phản hồi & lỗi (bản rút gọn)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMsg = error.response?.data?.message || error.response?.data?.error;

    let message = "Đã xảy ra lỗi.";

    if (error.code === "ERR_NETWORK") {
      message = "Không thể kết nối tới server. Vui lòng kiểm tra backend.";
    } else if (status === 401) {
      message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
    } else if (status === 403) {
      message = "Bạn không có quyền thực hiện hành động này.";
    } else if (status === 404) {
      message = "Không tìm thấy tài nguyên (404).";
    } else if (status === 400) {
      message = serverMsg ? `Dữ liệu không hợp lệ: ${serverMsg}` : "Dữ liệu gửi lên không hợp lệ.";
    } else if (status === 500) {
      message = serverMsg ? `Lỗi server: ${serverMsg}` : "Lỗi máy chủ (500).";
    } else if (serverMsg) {
      message = serverMsg;
    }

    error.userMessage = message;
    return Promise.reject(error);
  }
);

export default api;

