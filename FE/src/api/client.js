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
  return cfg;
});

export default api;
