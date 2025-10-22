import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8084/EVRentalSystem/api",
  timeout: 10000,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  // use ev_token which app stores earlier
  const token = localStorage.getItem("ev_token") || localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.message || err?.message || "Unknown error";
    return Promise.reject({ status: err?.response?.status, message });
  }
);

export default api;
