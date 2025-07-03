// lib/axios.ts
import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://vprikxgmlf.execute-api.us-east-1.amazonaws.com",
});

// Sempre anexa o token JWT no header
api.interceptors.request.use((config) => {
  // s� em client
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    console.log(">> Axios request para", config.url, "� token:", token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log("   Headers finais:", config.headers);
  }
  return config;
});

export default api;
