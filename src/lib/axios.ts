import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://vprikxgmlf.execute-api.us-east-1.amazonaws.com",
});

// Sempre anexa o token JWT no header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // ou sessionStorage, conforme seu fluxo
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
